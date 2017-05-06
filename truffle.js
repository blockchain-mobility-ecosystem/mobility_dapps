var HDWalletProvider = require("truffle-hdwallet-provider");
var walletsInfo = require("./hdwallets.json");

var mnemonic = walletsInfo['truffle']['mnemonic'];
var provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
//console.log(provider.getAddress());
//console.log(provider.wallet.getPrivateKey().toString('hex'));

module.exports = {
    networks: {
        development: {
            confirmationBlocks: 0,
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: provider,
            network_id: 3
        }
    }
};
