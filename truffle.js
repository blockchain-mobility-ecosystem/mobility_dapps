module.exports = {
    networks: {
        development: {
            confirmationBlocks: 0,
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            host: "localhost",
            port: 30303 ,
            network_id: 3
        }
    }
};
