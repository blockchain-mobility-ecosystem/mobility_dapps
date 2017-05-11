const series = require('async/series');
const geolib = require('geolib');
const GPS = require('gps');                                                       
const IPFS = require('ipfs');
const mqtt = require('mqtt');
const multiaddr = require('multiaddr')
const os = require('os')
const path = require('path')
const SerialPort = require('serialport');                                         
const Web3 = require('web3');

const appcommon = require('./app-common');
const keyfob = require('./keyfob');

/**
 * The in-car service class.
 * @constructor
 */
function CarService() {
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

    self._keyfob = keyfob; 
}

/**
 * Initialize and start IPFS node.
 */
CarService.prototype.startIpfs = function(callback) {
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
            self.ipfsNode.swarm.connect(appcommon.Configs.IPFS_Bootstrap_Peers[0], 
                    function (error) { 
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
 * @param {function} msgReceiver Callback function to process topic data.
 * @param {function} cb Callback to indicate subcribed status.
 */
CarService.prototype._subscribe2IPFSCarTopic = function(topic, msgReceiver, cb) {
    var self = this;
    if (!self.ipfsRunning) {
        return console.log('Error: IPFS node is not online!');
    }
    self.ipfsNode.pubsub.subscribe(topic, {discover: true}, msgReceiver);
    console.log('\nSubscribed to %s in IPFS.', topic);
    cb();
}

CarService.prototype._subscribe2MQTTCarTopic = function(topic, msgReceiver, cb) {
    var self = this;
    client = mqtt.connect(appcommon.Configs.MQTT_Broker_URL);
    client.on('connect', () => {
        client.subscribe(topic);
        console.log('\nSubscribed to %s from MQTT.', topic);
        cb();
    });
    client.on('message', msgReceiver);

}

CarService.prototype.listenCarTopic = function(M2MProtocol, topic, msgReceiver, cb) {
    var self = this;
    switch (M2MProtocol) {
        case 'MQTT': 
            self._subscribe2MQTTCarTopic(topic, msgReceiver, cb); 
            break;
        case 'IPFS': 
            self._subscribe2IPFSCarTopic(topic, msgReceiver, cb); 
            break;
        default: 
            throw new Error('M2M protocol %s not supported!', m2mProtocol);
    }
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
 * Execute car command.
 */
CarService.prototype.execCmd = function (command) {
    var self = this;
    switch(command) {
        case 'lock':
            console.log('\nLocking...');
            self._keyfob.lock();
            break;
        case 'unlock':
            console.log('\nUnlocking...');
            self._keyfob.unlock();
            break;
        default:
            console.log('\nUnsupported car command %s.', msg.cmd);
    }
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

