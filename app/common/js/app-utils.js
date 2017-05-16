const ethjsUtil = require('ethereumjs-util');
const contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');

/**
 * Check the MyEtherWallet signed message.
 * @param {String} msg The message string.
 * @param {Number} ttv The time to be valid for the message.
 */
exports.checkMyEtherWalletSignedMsg = function (msg, ttv) {
    msg = JSON.parse(msg);
    // Check signature
    console.log('\n>> Checking signature');
    var sig = msg.sig;
    delete msg['sig'];
    var sigParams = ethjsUtil.fromRpcSig(sig); 
    var msgHash = ethjsUtil.sha3(msg.msg);
    var pubkey = ethjsUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    var addr = ethjsUtil.pubToAddress(pubkey);
    addr = ethjsUtil.addHexPrefix(addr.toString('hex'));
    if (addr.toLowerCase() === msg.address.toLowerCase()) {
        console.log('\tsignature passed.');
    } else {
        console.log('Signature is bad, not able to process message.');
        return {pass: false};
    }
    // Check date
    var contents = msg.msg.split(' ');
    var cmd = contents[0].trim();
    var date = contents.slice(1).join(' ').trim();
    console.log('\n>> Checking signing date');
    var elapsed = new Date() - new Date(date);  // in milliseconds
    if (elapsed <= ttv) {
        console.log('\tdate passed.');
    } else {
        console.log('Message exceeds time limit to be valid.');
        return {pass: false};
    }
    return {pass: true, cmd: cmd, address: addr};
}

/**
 * Check signed message in oaken style data format.
 * @param {String} msg The message string.
 * @param {Number} ttv Time to be valid for the message.
 * @returns {json} Return an object {pass: Boolean, cmd: String, address: String}
 */
exports.checkOakenSignedMsg = function (msg, ttv) {
    msg = JSON.parse(msg);
    // Check signature
    console.log('\n>> Checking signature');
    var sig = msg.signature;
    delete msg['signature'];
    var sigParams = ethjsUtil.fromRpcSig(sig); 
    var msgHash = ethjsUtil.sha3(JSON.stringify(msg));
    var pubkey = ethjsUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    var addr = ethjsUtil.pubToAddress(pubkey);
    addr = ethjsUtil.addHexPrefix(addr.toString('hex'));
    if (addr === msg.address) {
        console.log('\tsignature passed.');
    } else {
        console.log('Signature is bad, not able to process message.');
        return {pass: false};
    }

    // Check date
    console.log('\n>> Checking signing date');
    var elapsed = new Date() - new Date(msg.date);  // in milliseconds
    if (elapsed <= ttv) {
        console.log('\tdate passed.');
    } else {
        console.log('Message exceeds time limit to be valid.');
        return {pass: false};
    }
    return {pass: true, cmd: msg.cmd, address: addr};

}

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
        console.log('Constract deployed at %s', instance.address);
        callback(instance);
    });
}

/**
 * Boostrap a web3 client and account.
 * @param {String} rpcName The client rpc name. ['testrpc', 'geth', 'infura']
 * @param {String} accountName The account name corresponding to the address 
 *      index of the wallet accounts. ['truffle', 'car', 'user', 'owner', etc.]
 * @param {JSON} hdconfig The json object for the account configurations.
 * @param callback The callback function with web3 and account as params.
 */
exports.bootstrapWeb3Account = function (rpcName, accountName, hdconfig, callback) {
    const accIdx = hdconfig['accounts'][accountName]['index'];
    const rpcconfig =  hdconfig['rpcs'][rpcName];
    const rpcserver = rpcconfig['protocol'] + '://' + rpcconfig['host'] + 
        (typeof rpcconfig['port'] === 'undefined' ? '' : (':'+rpcconfig['port']));
    let isHDWallet = rpcconfig['HD'];
    var web3;
    if (isHDWallet) {
        var hdwProvider = new HDWalletProvider(hdconfig['mnemonic'], rpcserver, accIdx);
        web3 = new Web3(hdwProvider);
    } else {
        if (rpcconfig['protocol'] === 'ipc') {
            web3 = new Web3(new Web3.providers.IpcProvider(rpcconfig['host'], require('net')));
        }
        else {
            web3 = new Web3(new Web3.providers.HttpProvider(rpcserver));
        }
    }

    web3.eth.getAccounts(function(err, accs) {
        if (err) throw new Error(err);
        if (accs.length == 0) {
            throw new Error("Couldn't get any accounts! Make sure your Ethereum \
                    client is configured correctly.");
        }
        var account = isHDWallet ? accs[0] : accs[accIdx];
        console.log("RPC %s connected at %s", rpcName, rpcserver); 
        console.log("Using %saccount %d: %s.", isHDWallet ? 'HD ' : '', accIdx, account); 
        callback(web3, account);
    });
}

