var Carpool = artifacts.require('Carpool');
var utils = require('../app/common/javascripts/app-utils');
var Web3 = require('web3');
var web3 = new Web3();

contract('Carpool', function(accounts) {
    var carpool;
    it("should create a new driver account", function() {
        return Carpool.deployed().then(function(instance) {
            carpool = instance;
            return instance.registerDriver('lex', 'L87673', {from: accounts[0]});
        }).then(function(result) {
            var log = utils.retrieveEventLog(result.logs, 'DriverRegistered');            
            assert.ok(log, 'DriverRegistered event not generated');
            if (log) {
                assert.equal(log.args.account, accounts[0], "Account not same");
                assert.equal(web3.toAscii(log.args.name).replace(/\0/g, ''), 
                        'lex', "Name wasn't logged correctly");
            }
            return carpool.registerDriver.call('lex0', 'L87666', {from: accounts[0]});
        }).then(function(result) {
            assert.equal(result.toNumber(), 1, "Account already exists error wasn't returned");
        });;
    });
});
