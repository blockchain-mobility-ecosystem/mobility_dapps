const series = require('async/series');
//const IPFS = require('ipfs');
const contract = require('truffle-contract');
const Web3 = require('web3');

// Contracts
const carpool_artifacts = require('../../build/contracts/Carpool.json');

// Project packages
const utils = require('./app-utils');

// -$- Initilization -$-
//const ipfs = new IPFS();

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var Carpool = contract(carpool_artifacts);
Carpool.setProvider(web3.currentProvider);

var accounts, account;
var carpool;
const accountIdx = 4;
series([
    // -$- Get accounts -$-
    (cb) => {
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                console.log("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                console.log("Couldn't get any accounts! Make sure your Ethereum \
                    client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];

            cb(); 
        });
    },
    // -$- IPFS node goes online -$-
    /*
    (cb) => {
        ipfs.on('ready', () => {
            console.log('IPFS node is ready.'); 

            ipfs.object.new('unixfs-dir', (err, node) => {
                if (err) {
                    throw err
                }
                console.log(node.toJSON().multihash)
                    // Logs:
                    // QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
            });

            ipfs.stop(() => {
                console.log('IPFS node if offline');
            })
            cb();
        });
    },
    */
    // -$- Deploy carpool contracdt -$-
    (cb) => {
        Carpool.deployed().then(function(instance) {
            carpool = instance;
            cb();
        });
    },
    // -$- Register driver -$-
    (cb) => {
        carpool.registerDriver.call('lex0', 'L8327788', 
                {from: accounts[accountIdx]}).then(function(result) {
            var error = result.toNumber();
            if (!error) {
                carpool.registerDriver('lex0', 'L8327788', {from: accounts[accountIdx], 
                    gas: 154000}).then(function(result) {
                    var log = utils.retrieveEventLog(result.logs, 'DriverRegistered');
                    if (log) {
                        console.log('Driver registered with account %s', log.args.account)
                            console.log('\tname: %s', web3.toAscii(log.args.name));
                    }
                });
            } else {
                console.log('Error registering drive, code: %d', error);
            }

            cb();
        });
    }
], (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Success!');
});

