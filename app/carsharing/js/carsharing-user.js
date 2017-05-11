const series = require('async/series');
const mqtt = require('mqtt');

const utils = require('../../common/js/app-utils');
const appcommon = require('../../common/js/app-common');

function CarSharingUser() {
}

CarSharingUser.prototype.startup = function(chainRPCName, callback) {
    var self = this;
    series([     
        (cb) => {
            utils.bootstrapWeb3Account(chainRPCName, 'user', appcommon.hdconfig, false, 
                    (web3, account) => {
                self.web3 = web3;
                self._account = account;
                cb();
            });       
        },
        (cb) => {
            let artifacts = appcommon.Artifacts.CarSharing;
            utils.bootstrapContract(self.web3.currentProvider, artifacts, (instance) => {
                self.carsharing = instance;       
                cb();
            });
            },
        (cb) => {
            self.mqttClient = mqtt.connect(appcommon.Configs.MQTT_Broker_URL);
            self.mqttClient.on('connect', () => {
                cb();
            });
        },
        
    ], (err) => {
        if (err) return console.log(err);
        console.log('\nCarSharing Dapp [user] node started!');
        if (callback) callback()
    });
}

CarSharingUser.prototype.register = function (name, license, callback) {
    var self = this;
    self.carsharing.registerUser.call(name, license, 
            {from: self._account}).then(function(result) {
        var error = result.toNumber();
        if (!error) {
            self.carsharing.registerUser(name, license, {from: self._account, 
                gas: 154000}).then(function(result) {
                var log = utils.retrieveEventLog(result.logs, 'UserRegistered');
                
                if (log) {
                    console.log('\nUser registered with account %s', log.args.account)
                        console.log('\tname: %s', self.web3.toAscii(log.args.name));
                    if(callback) callback();
                }
            });
        } else {
            console.log('\nError registering user, code: %d', error);
        }

    });
}

CarSharingUser.prototype.sendSignedCarCommand = function (cmd) {
    var self = this;
    var msg = {
        address: self._account,
        date: new Date(),
        cmd: cmd
    };
    var msgHash = self.web3.sha3(JSON.stringify(msg));
    console.log(msgHash);
    var signedMsg = self.web3.eth.sign(self._account, msgHash);
    msg.signature = signedMsg;
    //console.log(JSON.stringify(msg));
    self.mqttClient.publish(appcommon.MQTTTopics.CAR_COMMANDS, JSON.stringify(msg));
    console.log('\nCommand %s has been sent with topic %s', cmd, appcommon.MQTTTopics.CAR_COMMANDS);
}

// -$- Dapp starts from here -$-
var user = new CarSharingUser();
user.startup('testrpc', () => {
    user.register('lex1', 'L88888888', afterRegistered);
});

function afterRegistered() {
    user.sendSignedCarCommand('unlock');
}


