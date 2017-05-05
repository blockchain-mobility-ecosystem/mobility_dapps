const series = require('async/series');
const contract = require('truffle-contract');

const CarService = require('./car-service');
const utils = require('../../common/javascripts/app-utils');

var car = new CarService();
car.initWeb3(2);

const carpoolArtifacts = require('../../../build/contracts/Carpool.json');
var Carpool = contract(carpoolArtifacts);
Carpool.setProvider(car.web3.currentProvider);

series([     
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
    (cb) => {
        car.listenGPSData((data) => {
            if (car.gpsFixed) console.log(data);
        });
        cb();
    },
    // -$- Emulate running for x seconds -$-
    (cb) => setTimeout(cb, 3000),

], (err) => {
    if (err) {
        return console.log('\n', err);
    }
    car.stopService();
});

