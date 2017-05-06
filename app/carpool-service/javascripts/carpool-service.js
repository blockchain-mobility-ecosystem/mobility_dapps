const series = require('async/series');
const contract = require('truffle-contract');

const CarService = require('./car-service');
const utils = require('../../common/javascripts/app-utils');

const walletsPath = '../../../hdwallets.json';  // To derive car ropsten account.
var car = new CarService();

const carpoolArtifacts = require('../../../build/contracts/Carpool.json');
var Carpool = contract(carpoolArtifacts);
Carpool.setProvider(car.web3.currentProvider);

const receivedCmd = (msg) => {
    console.log('Received [%s] command from [%s]', msg.data.toString(), msg.from);
};

series([     
    (cb) => car.initWeb3(0, cb),
    //*
    (cb) => car.initIPFS(cb),
    //(cb) => setTimeout(cb, 60000),
    (cb) => {
        car.listenCarCommands(receivedCmd);
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
        Carpool.deployed().then(function(instance) {
            carpool = instance;
            console.log('Contract deployed at ' + carpool.address);
            cb();
        });
    },
    (cb) => {
        carpool.registerDriver.call('lex0', 'L8327788', 
                {from: car.account}).then(function(result) {
            var error = result.toNumber();
            if (!error) {
                carpool.registerDriver('lex0', 'L8327788', {from: car.account, 
                    gas: 154000}).then(function(result) {
                    var log = utils.retrieveEventLog(result.logs, 'DriverRegistered');
                    car.keyfob.unlock();
                    if (log) {
                        console.log('\nDriver registered with account %s', log.args.account)
                            console.log('\tname: %s', car.web3.toAscii(log.args.name));
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

