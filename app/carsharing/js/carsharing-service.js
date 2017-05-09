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

//var web3 = new Web3(hdwProvider);
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const accountIdx = 4;

const carSharingArtifacts = require('../../../build/contracts/CarSharing.json');
var CarSharingContract = contract(carSharingArtifacts);
CarSharingContract.setProvider(web3.currentProvider);

var carSharing;
var car;
var account;

const carM2MProtocol = 'MQTT';
const CAR_MSG_TTV = 3000;   // Message time-to-valid in milliseconds

function ipfsMsgReceiver(msg) {
    console.log('Received [%s] command from [%s]', msg.data.toString(), msg.from);
}

function mqttMsgReceiver(topic, msg) {
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
    if (elapsed <= CAR_MSG_TTV) {
        console.log('\tdate passed.');
    } else {
        return console.log('Message exceeds time limit to be valid.');
    }
    // Check permission
    console.log('\n>> Checking user permission');
    carSharing.checkPermission2AccessCar.call(addr, {from: account}).then((result) => {
        var err = result[0].toNumber();
        var permission = result[1].toNumber();
        if (err !== 0) {
            console.log('Error checking permission, errno: ', err);
        } else {
            console.log('User permission code: ', permission);
            // TODO unlock/lock per permission
            switch(msg.cmd) {
                case 'lock':
                    console.log('Locking');
                    car.keyfob.lock();
                    break;
                case 'unlock':
                    console.log('Unlocking');
                    car.keyfob.unlock();
                    break;
                default:
                    console.log('Unsupported car command %s.', msg.cmd);

            }
        }
    });

    
}

const carTopicReceiver = carM2MProtocol === 'MQTT' ? mqttMsgReceiver :
    carM2MProtocol === 'IPFS' ? ipfsMsgReceiver : null;
if (!carTopicReceiver) throw new Error('M2M not supported!')

series([     
    (cb) => {
        web3.eth.getAccounts(function(err, accs) {
            if (err) cb(err);
            if (accs.length == 0) {
                cb("Couldn't get any accounts! Make sure your Ethereum \
                        client is configured correctly.");
            }
            account = accs[accountIdx];
            console.log("Using ether account %d: %s", accountIdx, account); 
            cb(); 
        });
    },
    (cb) => car = new CarService(true, carM2MProtocol, cb),
    //*
    //(cb) => setTimeout(cb, 60000),
    (cb) => {
        car.listenCarTopic(carTopicReceiver);
        cb();
    },
    // Write something
    (cb) =>  {
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
    },
    //*/
    (cb) => {
        CarSharingContract.deployed().then(function(instance) {
            carSharing = instance;
            console.log('\nContract deployed at ' + carSharing.address);
            cb();
        });
    },
    (cb) => {
        carSharing.registerUser.call('lex0', 'L8327788', 
                {from: account}).then(function(result) {
            var error = result.toNumber();
            if (!error) {
                carSharing.registerUser('lex0', 'L8327788', {from: account, 
                    gas: 154000}).then(function(result) {
                    var log = utils.retrieveEventLog(result.logs, 'UserRegistered');
                    
                    if (log) {
                        console.log('\nUser registered with account %s', log.args.account)
                            console.log('\tname: %s', web3.toAscii(log.args.name));
                    }
                    cb();
                });
            } else {
                console.log('\nError registering drive, code: %d', error);
                cb();
            }

        });
    },
    // -$- Setup GPS listener -$-
    /*
    (cb) => {
        car.listenGPSData((data) => {
            if (car.gpsFixed) console.log(data);
        });
        cb();
    },
    //*/
    // -$- Emulate running for x ms -$-
    (cb) => setTimeout(cb, 300000),

], (err) => {
    if (err) {
        return console.log('\n', err);
    }
    car.stopService();
});

