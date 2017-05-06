const series = require('async/series');
const geolib = require('geolib');
const GPS = require('gps');                                                       
const IPFS = require('ipfs');
const multiaddr = require('multiaddr')
const os = require('os')
const path = require('path')
const SerialPort = require('serialport');                                         
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');

const keyfob = require('./keyfob');

const CAR_CMD_TOPIC = 'car-command-to-me';

/**
 * The in-car service class.
 * @param {String} walletProvider To select account provider. If 'web3', use
 *   default web3 provider. Otherwise, use HD wallet info in the provided file.
 * @constructor
 */
function CarService(walletProvider) {
    var self = this;
    self.ipfsNode = new IPFS({
        repo: path.join(os.tmpdir() + '/' + new Date().toString()),
        init: false,
        start: false,
        EXPERIMENTAL: {
            pubsub: true,
            //sharding: true
        },
    });
    self.ipfsRunning = false;
    
    walletProvider = typeof walletProvider !== 'undefined' ? walletProvider : 'web3';
    var web3 = new Web3();
    if (walletProvider !== 'web3') { 
        var walletsInfo = require(walletProvider);
        var carWallet = walletsInfo['car']; 
        var hdwProvider = new HDWalletProvider(carWallet['mnemonic'], "https://ropsten.infura.io/",
                carWallet['index']);
        web3.setProvider(hdwProvider);
    } else {
        var web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
        web3.setProvider(web3Provider);
    }
    self.web3 = web3;

    self.gps = new GPS;                                                              
    self.gpsFixed = false;
    self.gpsRunning = false;
    self.port = new SerialPort('/dev/ttyS0', {                                       
        baudrate: 9600,                                                             
        parser: SerialPort.parsers.readline('\r\n')                                 
    });

    self.keyfob = keyfob; 

}

/**
 * Initialize and start IPFS node.
 */
CarService.prototype.initIPFS = function(callback) {
    var self = this;
    series([
        (cb) => {
            self.ipfsNode.version((err, version) => {
                if (err) { return cb(err) }
                console.log('\nIPFS Version:', version.version);
                cb();
            })
        },
        (cb) => self.ipfsNode.init({ emptyRepo: true, bits: 2048,}, cb),
        (cb) => self.ipfsNode.start(cb),
        (cb) => {
            if (self.ipfsNode.isOnline()) {
                console.log('IPFS node is now ready and online')
            }
            self.ipfsRunning = true;
            cb();
        },
        (cb) => {
            self.ipfsNode.id((err, identity) => {
                if (err) { return cb(err) }
                console.log(identity.id);
                cb();
            });
        },
        
    ], (err) => {
        if (err) {
            callback(err);
            return console.log('\n', err);
        }
        callback();
    });

}

/**
 * Listen to the car command topic from IPFS P2P pubsub network.
 * @param {function} dataCallback Callback function to process topic data.
 */
CarService.prototype.listenCarCommands = function(dataCallback) {
    var self = this;
    if (!self.ipfsRunning) {
        return console.log('Error: IPFS node is not online!');
    }
    self.ipfsNode.pubsub.subscribe(CAR_CMD_TOPIC, dataCallback);
    console.log('\nNow listening car commands.');
}

/**
 * Initialize Web3 client.
 * @param {function} cb Callback to signal the completion or error.
 */
CarService.prototype.initWeb3 = function(accountIdx, cb) {
    var self = this;
    accountIdx = typeof accountIdx !== 'undefined' ? accountIdx : 0;
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
