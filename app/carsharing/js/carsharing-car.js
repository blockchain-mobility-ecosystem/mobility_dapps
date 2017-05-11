const series = require('async/series');
const ethjsUtil = require('ethereumjs-util');

const common = require('../../common/js/app-common.js');
const utils = require('../../common/js/app-utils');
const CarService = require('../../common/js/car-service');

function CarSharing() {
    var self = this;
    self.CAR_MSG_TTV = 1000*60;
}

CarSharing.prototype._mqttMsgDispatch = function (topic, msg) {
    var self = this;
    switch(topic) {
        case common.MQTTTopics.CAR_COMMANDS:
            self.processCarCommand(msg);
            break;
        default:
            console.log('Unable to process topic ', topic);
    }
}

CarSharing.prototype.bootup = function(rpcName, callback) {
    var self = this;
    series([     
        (cb) => {
            utils.bootstrapWeb3Account(rpcName, 'car', common.hdconfig, false, (web3, account) => {
                self.web3 = web3;
                self._account = account;
                cb();
            });
        },
        (cb) => {
            let artifacts = common.Artifacts.CarSharing;
            utils.bootstrapContract(self.web3.currentProvider, artifacts, (instance) => {
                self.carsharingIns = instance;       
                cb();
            });
        },
        (cb) => {
            self.car = new CarService();
            //cb();
            self.car.startIpfs(cb);
        },
        (cb) => self.car.listenCarTopic('MQTT', common.MQTTTopics.CAR_COMMANDS, 
                (topic, msg) => {
                    self._mqttMsgDispatch(topic, msg);
                }, cb),
        
    ], (err) => {
        if (err) {
            return console.log('\n', err);
        }
        console.log('\nCarSharing Dapp [car] node booted!');
        if (callback) callback();
    });
}

CarSharing.prototype.updateCarLocation = function() {
    var self = this;
    self.car.listenGPSData((data) => {
        if (self.car.gpsFixed) console.log(data);
        /*
        const obj = {
            Data: new Buffer('Some data'),
            Links: []
        };

        car.ipfsNode.object.put(obj, (err, node) => {
            if (err) {
                cb(err)
            }
            console.log(node.toJSON().multihash);
            // Logs:
            // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
            cb();
        });
        */
    });
}

CarSharing.prototype.shutdown = function () {
    var self = this;
    self.car.stopService();
}

CarSharing.prototype.processCarCommand = function (msg) {
    var self = this;
    var msg = msg.toString().trim();
    msg = JSON.parse(msg);
    console.log('Received new message:\n', msg);

    // Check signature
    console.log('\n>> Checking signature');
    var sig = msg.signature;
    delete msg['signature'];
    var sigParams = ethjsUtil.fromRpcSig(sig); 
    var sigHash = ethjsUtil.sha3(JSON.stringify(msg));
    var pubkey = ethjsUtil.ecrecover(sigHash, sigParams.v, sigParams.r, sigParams.s);
    var addr = ethjsUtil.pubToAddress(pubkey);
    addr = ethjsUtil.addHexPrefix(addr.toString('hex'));
    if (addr === msg.address) {
        console.log('\tsignature passed.');
    } else {
        return console.log('Signature is bad, not able to process message.');
    }

    // Check date
    console.log('\n>> Checking signing date');
    var elapsed = new Date() - new Date(msg.date);  // in milliseconds
    if (elapsed <= self.CAR_MSG_TTV) {
        console.log('\tdate passed.');
    } else {
        return console.log('Message exceeds time limit to be valid.');
    }

    // Check permission
    console.log('\n>> Checking user permission');
    self.carsharingIns.checkPermission2AccessCar.call(addr, {from: self._account})
            .then((result) => {
        var err = result[0].toNumber();
        var permission = result[1].toNumber();
        if (err !== 0) {
            console.log('Error checking permission, errno: ', err);
        } else {
            console.log('User permission code: ', permission);
            self.car.execCmd(msg.cmd);
        }
    });
}

// -$- Application -$-
var csDapp = new CarSharing();
csDapp.bootup('testrpc');

