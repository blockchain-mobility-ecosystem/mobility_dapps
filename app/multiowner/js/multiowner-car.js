const series = require('async/series');

const CarService = require('../../car/js/car-service');
const utils = require('../../common/js/app-utils');
const appcommon = require('../../common/js/app-common');

var moInstance;
var car;
var account;

const CAR_MSG_TTV = 1000*60*60*24;   // Message time-to-valid in milliseconds

function mqttMsgReceiver(topic, msg) {
    var msg = msg.toString().trim();
    console.log('\nReceived new message ', msg);
    var checked = utils.checkMyEtherWalletSignedMsg(msg, CAR_MSG_TTV);
    if (!checked.pass) return;
    // Check permission
    console.log('\n>> Checking user permission');
    moInstance.isOwner.call(checked.address, {from: account}).then((result) => {
        if (result) {
            console.log('\tauthorized');
            car.execCmd(checked.cmd); 
        } else {
            console.log('\tUser %s unauthorized to access car', checked.address);
        }
    });
}

series([     
    (cb) => {
        utils.bootstrapWeb3Account('infura', 'car', appcommon.hdconfig,
                (_web3, _account) => {
            web3 = _web3;
            account = _account;
            cb();
        });
    },
    (cb) => {
        let artifacts = appcommon.Artifacts.MultiOwnership;
        utils.bootstrapContract(web3.currentProvider, artifacts, (instance) => {
            moInstance = instance;
            cb();
        });
    },
    (cb) => {
        car = new CarService();
        cb();
    },
    (cb) => {
        car.listenCarTopic('MQTT', appcommon.MQTTTopics.CAR_COMMANDS_MULTIOWNER, 
                mqttMsgReceiver, cb);
    },
    
], (err) => {
    if (err) {
        console.log('\n', err);
    }
});

