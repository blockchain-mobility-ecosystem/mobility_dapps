const series = require('async/series');
const geolib = require('geolib');
const GPS = require('gps');                                                       
const IPFS = require('ipfs');
const multiaddr = require('multiaddr')
const os = require('os')
const path = require('path')
const SerialPort = require('serialport');                                         
const Web3 = require('web3');

const keyfob = require('./keyfob');

const CAR_CMD_TOPIC = 'car-command-to-me';

var bootstrapWsAddr = '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd';

/**
 * The in-car service class.
 * @param {boolean} enableIPFS To start IPFS or not.
 * @param {function} callback Function to call when IPFS started.
 *
 * @constructor
 */
function CarService(enableIPFS, callback) {
    var self = this;
    self.ipfsNode = new IPFS({
        //repo: path.join(os.tmpdir() + '/' + new Date().toString()),
        init: false,
        start: false,
        EXPERIMENTAL: {
            pubsub: true,
            //sharding: true
        },
    });
    self.ipfsRunning = false;
   
    self.gps = new GPS;                                                              
    self.gpsFixed = false;
    self.gpsRunning = false;
    self.gpsport = new SerialPort('/dev/ttyS0', {                                       
        baudrate: 9600,                                                             
        parser: SerialPort.parsers.readline('\r\n')                                 
    });

    self.keyfob = keyfob; 

    if (enableIPFS)  self._initIPFS(callback);
    else callback();
}

/**
 * Initialize and start IPFS node.
 */
CarService.prototype._initIPFS = function(callback) {
    var self = this;
    series([
        /*
        (cb) => {
            self.ipfsNode.version((err, version) => {
                if (err) { return cb(err) }
                console.log('\nIPFS Version:', version.version);
                cb();
            })
        },
        */
        (cb) => {
            self.ipfsNode._repo.exists((err, exists) => {
                if (err) return cb(err);
                if (exists) self.ipfsNode.on('ready', cb);
                else self.ipfsNode.init({ emptyRepo: true, bits: 2048}, cb);
            });
        },
        (cb) => self.ipfsNode.start(cb),
        (cb) => {
            if (!self.ipfsNode.isOnline()) return cb('error bringing ipfs online');
            self.ipfsRunning = true;
            self.ipfsNode.id((err, identity) => {
                if (err) return cb(err);
                console.log('IPFS node id ' + identity.id);
                self.ipfsNodeId = identity.id;
                cb();
            });
        },
        // -$- Connect to bootstrap peers -$-
        (cb) => {
            self.ipfsNode.swarm.connect(bootstrapWsAddr, function (error) { 
                if (error) cb(error);
                cb();
            });
        },
        (cb) => {
            self.ipfsNode.swarm.peers((err, peerInfos) => {
                if (err) cb(err);
                //console.log(peerInfos);
                cb();
            });
        }
        
    ], (err) => {
        if (err) {
            return callback(err);
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
 * Start listening GPS data.
 * @param {function} dataCallback The callback function to receive the data.
 */
CarService.prototype.listenGPSData = function(dataCallback) {
    var self = this;
    self.gpsport.on('data', function(data) {                                                
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
                self.gpsport.off('data');
            } 
            cb();
        }
    ], (err) => {
        if (err) return console.log(err);
        console.log('Car service stopped.');
    });
}

module.exports = CarService;
