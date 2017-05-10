const series = require('async/series');
const ethjsUtil = require('ethereumjs-util');
const contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');

const CarService = require('../../common/js/car-service');
const utils = require('../../common/js/app-utils');

const walletsPath = '../../../hdwallets.json';  // To derive car ropsten account.
var walletsInfo = require(walletsPath);
var hdwProvider = new HDWalletProvider(walletsInfo['car']['mnemonic'], 
        "https://ropsten.infura.io/", walletsInfo['car']['index']);

var web3 = new Web3(hdwProvider);
//var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const accountIdx = 0;

const artifacts = require('../../../build/contracts/MultiOwnership.json');
var MultiOwnership = contract(artifacts);
MultiOwnership.setProvider(web3.currentProvider);

var moInstance;
var car;
var account;

const CAR_MSG_TTV = 1000*60*60*24;   // Message time-to-valid in milliseconds

function mqttMsgReceiver(topic, msg) {
    var msg = msg.toString().trim();
    msg = JSON.parse(msg);
     
    console.log('Received new message:\n', msg);
    // Check signature
    console.log('\n>> Checking signature');
    var sig = msg.sig;
    delete msg['sig'];
    var sigParams = ethjsUtil.fromRpcSig(sig); 
    console.log(JSON.stringify(msg));
    var msgHash = ethjsUtil.sha3(msg.msg);
    var pubkey = ethjsUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    var addr = ethjsUtil.pubToAddress(pubkey);
    addr = ethjsUtil.addHexPrefix(addr.toString('hex'));
    if (addr.toLowerCase() === msg.address.toLowerCase()) {
        console.log('\tsignature passed.');
    } else {
        return console.log('Signature is bad, not able to process message.');
    }
    // Check date
    var contents = msg.msg.split(' ');
    var cmd = contents[0].trim();
    var date = contents.slice(1).join(' ').trim();
    console.log('\n>> Checking signing date');
    var elapsed = new Date() - new Date(date);  // in milliseconds
    if (elapsed <= CAR_MSG_TTV) {
        console.log('\tdate passed.');
    } else {
        return console.log('Message exceeds time limit to be valid.');
    }
    // Check permission
    console.log('\n>> Checking user permission');
    moInstance.isOwner.call(addr, {from: account}).then((result) => {
        if (result) {
            switch(cmd) {
                case 'lock':
                    console.log('Locking');
                    car.keyfob.lock();
                    break;
                case 'unlock':
                    console.log('Unlocking');
                    car.keyfob.unlock();
                    break;
                default:
                    console.log('Unsupported car command %s.', cmd);

            }
        } else {
            console.log('User %s unauthorized to access car', addr);
        }
    });
}

series([     
    (cb) => {
        web3.eth.getAccounts(function(err, accs) {
            if (err) return cb(err);
            if (accs.length == 0) {
                return cb("Couldn't get any accounts! Make sure your Ethereum \
                        client is configured correctly.");
            }
            account = accs[accountIdx];
            console.log("Using ether account %d: %s", accountIdx, account); 
            cb(); 
        });
    },
    (cb) => {
        car = new CarService(false, 'MQTT');
        cb();
        //car.initIPFS(cb);
    },
    (cb) => {
        MultiOwnership.deployed().then(function(instance) {
            moInstance = instance;
            console.log('\nContract deployed at ' + moInstance.address);
            cb();
        });
    },
    (cb) => {
        car.listenCarTopic('Oaken4Car-MultiOwnership', mqttMsgReceiver, cb);
    },
    
], (err) => {
    if (err) {
        console.log('\n', err);
    }
});

