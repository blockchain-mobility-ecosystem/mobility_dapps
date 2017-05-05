const series = require('async/series');
const geolib = require('geolib');
const GPS = require('gps');                                                       
const IPFS = require('ipfs');
const os = require('os')
const path = require('path')
const SerialPort = require('serialport');                                         
const Web3 = require('web3');

/**
 * The in-car service class.
 * @constructor
 */
function CarService() {
    var self = this;
    self.ipfsNode = new IPFS({
        repo: path.join(os.tmpdir() + '/' + new Date().toString()),
        init: false,
        start: false,
        EXPERIMENTAL: {
            pubsub: true
        }
    });
    self.ipfsRunning = false;

    var web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    self.web3 = web3;

    self.gps = new GPS;                                                              
    self.gpsFixed = false;
    self.gpsRunning = false;
    self.port = new SerialPort('/dev/ttyS0', {                                       
        baudrate: 9600,                                                             
        parser: SerialPort.parsers.readline('\r\n')                                 
    });
}

/**
 * Initialize and start IPFS node.
 */
CarService.prototype.initIPFS = function() {
    var self = this;
    series([
        // -$- IPFS node goes online -$-
        (cb) => {
            self.ipfsNode.version((err, version) => {
                if (err) { return cb(err) }
                console.log('\nIPFS Version:', version.version);
                cb();
            })
        },
        (cb) => self.ipfsNode.init({ emptyRepo: true, bits: 2048 }, cb),
        (cb) => self.ipfsNode.start(cb),
        (cb) => {
            if (self.ipfsNode.isOnline()) {
                console.log('IPFS node is now ready and online')
            }
            self.ipfsRunning = true;
            cb();
        },
    ], (err) => {
        if (err) return console.log('\n', err);
    });

}

/**
 * Initialize Web3 client.
 */
CarService.prototype.initWeb3 = function(accountIdx) {
    var self = this;
    accountIdx = typeof accountIdx !== 'undefined' ? accountIdx : 0;
    series([
            // -$- Get accounts -$-
            (cb) => {
                self.web3.eth.getAccounts(function(err, accs) {
                    if (err != null) {
                        console.log("There was an error fetching your accounts.");
                        cb(err);}
                    if (accs.length == 0) {
                        cb("Couldn't get any accounts! Make sure your Ethereum \
                                client is configured correctly.");
                    }

                    self.accounts = accs;
                    self.account = self.accounts[accountIdx];
                    console.log("Using account %d: %s", accountIdx, self.account); 
                    cb(); 
                });
            },
    ], (err) => {
        if (err) {
            return console.log('\n', err);
        }
    });
}

/**
 * Start listening GPS data.
 * @param {function} dataCallback The callback function to receive the data.
 */
CarService.prototype.listenGPSData = function(dataCallback) {
    var self = this;
    self.port.on('data', function(data) {                                                
        self.gps.update(data);                                                           
    });
    self.gps.on('GGA', function(data) {                                                  
        if (data.quality !== null) {
            self.gpsFixed = true;
        } else {
            self.gpsFixed = false;
        }
        /*
           console.log(data.time, data.lat, data.lon);                                 
           console.log(data.time.constructor);                                         
           if (data.lat != null) {                                                     
           console.log(geolib.decimal2sexagesimal(data.lat),                       
           geolib.decimal2sexagesimal(data.lon));                          
           }                                                                           
           */
        // -$- Preprocessing data ? -$-
        dataCallback(data);
        
    });
    
    self.gpsListening = true;

}

/**
 * Stop car service.
 */
CarService.prototype.stopService = function() {
    var self = this;
    series([
        (cb) => {
            if (self.ipfsRunning) {
                self.ipfsNode.stop(cb);
            } else {
                cb();
            }
        },
        (cb) => {
            if (self.gpsListening) {
                self.gps.off('GGA');
            } 
            cb();
        }
    ], (err) => {
        if (err) return console.log(err);
        console.log('Car service stopped.');
    });
}

module.exports = CarService;
