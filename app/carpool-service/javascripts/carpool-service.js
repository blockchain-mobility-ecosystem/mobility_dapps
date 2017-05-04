const series = require('async/series');
const IPFS = require('ipfs');
const os = require('os')
const path = require('path')
const contract = require('truffle-contract');
const Web3 = require('web3');

const utils = require('../../common/javascripts/app-utils');

const node = new IPFS({
    repo: path.join(os.tmpdir() + '/' + new Date().toString()),
    init: false,
    start: false,
    EXPERIMENTAL: {
        pubsub: true
    }
});

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Carpool contracts
const carpool_artifacts = require('../../../build/contracts/Carpool.json');
var Carpool = contract(carpool_artifacts);
Carpool.setProvider(web3.currentProvider);

var accounts;
var carpool;
const accountIdx = 6;
series([
    // -$- Get accounts -$-
    (cb) => {
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                console.log("There was an error fetching your accounts.");
                cb(err);}
            if (accs.length == 0) {
                cb("Couldn't get any accounts! Make sure your Ethereum \
                    client is configured correctly.");
            }

            accounts = accs;
            console.log("Using account %d: %s", accountIdx, accounts[accountIdx]); 
            cb(); 
        });
    },
    // -$- IPFS node goes online -$-
    (cb) => {
        node.version((err, version) => {
            if (err) { return cb(err) }
            console.log('\nIPFS Version:', version.version);
            cb();
        })
    },
    (cb) => node.init({ emptyRepo: true, bits: 2048 }, cb),
    (cb) => node.start(cb),
    (cb) => {
        if (node.isOnline()) {
            console.log('IPFS node is now ready and online')
        }
        cb();
    },
 
    // -$- Deploy carpool contract -$-
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
    (cb) => {
        node.stop(cb);
    }
], (err) => {
    if (err) {
        return console.log('\n', err);
    }
    console.log('\nFinished!');
});

