const series = require('async/series');
const contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');

const CarService = require('./car-service');
const utils = require('../../common/javascripts/app-utils');

const walletsPath = '../../../hdwallets.json';  // To derive car ropsten account.
var walletsInfo = require(walletsPath);
var hdwProvider = new HDWalletProvider(walletsInfo['car']['mnemonic'], 
        "https://ropsten.infura.io/", walletsInfo['car']['index']);

//var web3 = new Web3(hdwProvider);
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const accountIdx = 4;

const carpoolArtifacts = require('../../../build/contracts/Carpool.json');
var CarpoolContract = contract(carpoolArtifacts);
CarpoolContract.setProvider(web3.currentProvider);

var carpool;
var car;
var account;
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
    (cb) => car = new CarService(false, cb),
    /*
    (cb) => setTimeout(cb, 60000),
    (cb) => {
        car.listenCarCommands((msg) => {
            console.log('Received [%s] command from [%s]', msg.data.toString(), msg.from);
        });
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
        CarpoolContract.deployed().then(function(instance) {
            carpool = instance;
            console.log('\nContract deployed at ' + carpool.address);
            cb();
        });
    },
    (cb) => {
        carpool.registerDriver.call('lex0', 'L8327788', 
                {from: account}).then(function(result) {
            var error = result.toNumber();
            if (!error) {
                carpool.registerDriver('lex0', 'L8327788', {from: account, 
                    gas: 154000}).then(function(result) {
                    var log = utils.retrieveEventLog(result.logs, 'DriverRegistered');
                    car.keyfob.unlock();
                    if (log) {
                        console.log('\nDriver registered with account %s', log.args.account)
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
    */
    // -$- Emulate running for x seconds -$-
    (cb) => setTimeout(cb, 300000),

], (err) => {
    if (err) {
        return console.log('\n', err);
    }
    car.stopService();
});

