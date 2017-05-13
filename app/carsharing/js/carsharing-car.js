const series = require('async/series');
const ethjsUtil = require('ethereumjs-util');

const common = require('../../common/js/app-common.js');
const utils = require('../../common/js/app-utils');
const CarService = require('../../common/js/car-service');
const carconfig = require('./car-config');

function CarSharing(carInfo) {
    var self = this;
    self.CAR_MSG_TTV = 1000*60;
    self.carInfo = carInfo;
}

CarSharing.prototype._mqttMsgDispatch = function (topic, msg) {
    var self = this;
    switch(topic) {
        case common.MQTTTopics.CAR_COMMANDS_CARSHARING:
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
            utils.bootstrapWeb3Account(rpcName, 'car', common.hdconfig, 
                    (web3, account) => {
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
            self.car.startIpfsApi();
            cb();
        },
        (cb) => self.car.listenCarTopic('MQTT', common.MQTTTopics.CAR_COMMANDS_CARSHARING, 
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

CarSharing.prototype.updateCarProfile = function() {
    var self = this;
    var profile = {
        info: self.carInfo,
        loc: self.car.loc,
        speed: self.car.speed
    } 
    /*
    const obj = {
        Data: new Buffer(JSON.stringify(profile)),
        Links: []
    };
    self.car.ipfsNode.object.put(obj, (err, node) => {
        if (err) throw err;
        var multihash = node.toJSON().multihash;
        console.log(multihash);
        // -$- Update IPNS -$-
        self.car.ipfsNode.name.publish(multihash, (err, result) => {
            console.log(result);
        });
        self.car.ipfsNode.object.data(multihash, (err, data) => {
            if (err) throw err;
            console.log(data.toString());
        });
    });
    */
    self.car.ipfsNode.files.add([ {
        path: '/tmp/profile.txt',
        content: new Buffer(JSON.stringify(profile))
    }], (err, res) => {
        if (err) throw err;
        for(var i = 0; i < res.length; i++) {
            if (res[i].path === '/tmp/profile.txt') {
                self.car.ipfsNode.name.publish(res[i].hash, (err, res) => {
                    if (err) throw err;
                    console.log(res);
                    self.car.ipfsNode.name.resolve(res, (err, res) => {
                        console.log(res);
                    });
                });
                return;
            }
        }
    });
}

CarSharing.prototype.startProfileUpdateTimer = function() {
    var self = this;
    self.profileUpdateTimer = setInterval(() => {
        self.updateCarProfile();
    }, 1000*30);
}

CarSharing.prototype.shutdown = function () {
    var self = this;
    self.car.stopService();
}

CarSharing.prototype.processCarCommand = function (msg) {
    var self = this;
    var msg = msg.toString().trim();
    console.log('\nReceived new message: ', msg);
    var checked = utils.checkOakenSignedMsg(msg, self.CAR_MSG_TTV);
    if (!checked.pass) return;

    // Check permission
    console.log('\n>> Checking user permission');
    self.carsharingIns.checkPermission2AccessCar.call(checked.address, 
            {from: self._account}).then((result) => {
        var err = result[0].toNumber();
        var permission = result[1].toNumber();
        err = 0;
        if (err !== 0) {
            console.log('Error checking permission, errno: ', err);
        } else {
            console.log('User permission code: ', permission);
            self.car.execCmd(checked.cmd);
        }
    });
}

// -$- Application -$-
var csDapp = new CarSharing(carconfig['OakenTestCar']);
csDapp.bootup('testrpc', () => {
    csDapp.car.startGPSData();
    csDapp.startProfileUpdateTimer();
});


