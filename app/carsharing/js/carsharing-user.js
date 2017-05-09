const series = require('async/series');
const mqtt = require('mqtt');
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');


// -$- Retrieve account private key -$-
const walletsPath = '../../../hdwallets.json';  // To derive car ropsten account.
var walletsInfo = require(walletsPath);
var hdwProvider = new HDWalletProvider(walletsInfo['car']['mnemonic'], 
        "https://ropsten.infura.io/", walletsInfo['car']['index']);

//var web3 = new Web3(hdwProvider);
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var account;
const accountIdx = 5;
var mqttClient;
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
    (cb) => {
        mqttClient = mqtt.connect('tcp://35.166.170.137:1883');
        mqttClient.on('connect', () => {
            cb();
        });
    },
    (cb) => {
        var msg = {
            address: account,
            date: new Date(),
            cmd: 'unlock'
        };
        var msgHash = web3.sha3(JSON.stringify(msg));
        console.log(msgHash);
        var signedMsg = web3.eth.sign(account, msgHash);
        msg.signature = signedMsg;
        console.log(JSON.stringify(msg));

        mqttClient.publish('Oaken4Car', JSON.stringify(msg));
        mqttClient.end();
        cb();
    }
]);

