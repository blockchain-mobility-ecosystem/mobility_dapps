var HDWalletProvider = require("truffle-hdwallet-provider");
var hdconfig = require("./hdconfig.json");

var mnemonic = hdconfig['mnemonic'];
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
        ropsten_infura: {
            provider: provider,
            network_id: 3
        },
        ropsten_geth: {
            host: "localhost",
            port: 8545,
            network_id: 3
        }
    }
};
