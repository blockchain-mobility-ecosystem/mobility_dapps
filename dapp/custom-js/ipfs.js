const IPFSAPI = IpfsApi('/ip4/127.0.0.1/tcp/5002');

//const ipfsMini = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const ipfsMini = new IPFS({ host: 'localhost', port: 5002, protocol: 'http' });

function addFileToIPFS(obj) {
    ipfsMini.addJSON(obj, (err, result) => {
        console.log(err, result);
        return result;
    });

}

function retrieveFileFromIPFS(multihash, callback) {
    ipfsMini.catJSON(multihash, (err, result) => {
        console.log(err, result);
        console.log("JSON: " + result);
        callback(result);
    });
}

function addToIPNS(multihash) {
    var promisedPublishResult = Promise.resolve(IPFSAPI.name.publish(multihash));

    var publishResult = Promise.resolve(promisedPublishResult);
    publishResult.then(function(e) {
        console.log(e);
        return e;
    });
};

function resolveFromIPNS(multihash, callback) {
    IPFSAPI.name.resolve(multihash, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(err, result);
        console.log("IPNS Name: " + result);
        callback(result);
    });
}