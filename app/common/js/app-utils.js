const contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');

/**
 * Retrieve transaction logs.
 * 
 * @param {Array} logs Array of decoded events that were triggered within this transaction.
 * @param {String} name The name of the event;
 */
exports.retrieveEventLog = function (logs, name) {
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event == name) {
            return log;
        }
    }
    return null;
}

/**
 * Bootstrap a truffle contract instance.
 * @param provider The blockchain provider.
 * @param artifacts The generated contract artifacts.
 * @param callback Callback with the contract instance.
 */
exports.bootstrapContract = function (provider, artifacts, callback) {
    var Contract = contract(artifacts);
    Contract.setProvider(provider);
    Contract.deployed().then((instance) => {
        callback(instance);
    });
}



exports.bootstrapWeb3Account = function (rpcName, accountName, hdconfig, 
        isHDWallet, callback) {
    const accIdx = hdconfig['accounts'][accountName]['index'];
    const rpcconfig =  hdconfig['rpcs'][rpcName];
    const rpcserver = 'http://' + rpcconfig['host'] + (typeof rpcconfig['port'] === 'undefined' ? 
                 '' : (':'+rpcconfig['port']));
    var web3;
    if (isHDWallet) {
        var hdwProvider = new HDWalletProvider(hdconfig['mnemonic'], rpcserver, accIdx);
        web3 = new Web3(hdwProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider(rpcserver))
    }
    web3.eth.getAccounts(function(err, accs) {
        if (err) throw new Error(err);
        if (accs.length == 0) {
            throw new Error("Couldn't get any accounts! Make sure your Ethereum \
                    client is configured correctly.");
        }
        var account = accs[accIdx];
        console.log("RPC %s connected at %s", rpcName, rpcserver); 
        console.log("Using ether account %d: %s.", accIdx, account); 
        callback(web3, account);
    });
}
