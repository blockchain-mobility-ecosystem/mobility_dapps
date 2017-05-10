const series = require('async/series');
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');


// -$- Retrieve account private key -$-
const walletsPath = '../../../hdwallets.json';  // To derive car ropsten account.
var walletsInfo = require(walletsPath);
var hdwProvider = new HDWalletProvider(walletsInfo['car']['mnemonic'], 
        "https://ropsten.infura.io/", walletsInfo['car']['index']);

var web3 = new Web3(hdwProvider);
//var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var account;
const accountIdx = 0;

const abi = require('../../../build/contracts/MultiOwnership.json')['abi'];
//const moAddr = '0x4fca9b48110ced94585d1587d77633a2d7c1e3ee';
const moAddr = '0xae0d3e506ef19770477e974c50fabd3c1ecdd34b';
const MultiOwnership = web3.eth.contract(abi);
var moInstance = MultiOwnership.at([moAddr]);
var depositEvent = moInstance.DepositReceived();

depositEvent.watch({}, (err, result) => {
    if (err) return console.log(err);
    console.log(result); 
});

series([     
    (cb) => {
        web3.eth.getAccounts(function(err, accs) {
            if (err) return cb(err);
            if (accs.length == 0) {
                return cb("Couldn't get any accounts! Make sure your Ethereum \
                        client is configured correctly.");
            }
            console.log(accs);
            account = accs[accountIdx];
            
            console.log("Using ether account %d: %s", accountIdx, account); 
            cb(); 
        });
    },
    // -$- sending ether to multiownship contract -$-
    (cb) => {
        web3.eth.sendTransaction({from: account, to: moAddr, value: web3.toWei(0.05, 'ether')}, (err, tranhash) => {
            if (err) return cb(err);
            console.log(tranhash);
            cb(); 
        });
    },
    (cb) => {
        web3.eth.getTransactionReceipt(tranhash, (err, receipt) => {
            if (err) return cb(err);
            console.log(receipt);
            cb();
        });
    },
], (err) => {
    if (err) console.log('Error', err);
});
