//const IPFSAPI = IpfsApi('/ip4/127.0.0.1/tcp/5002');

//const ipfsMini = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const ipfsMini = new IPFS({ host: 'localhost', port: 5002, protocol: 'http' });

const ipfs = IpfsApi('ipfs.infura.io', '5001', {'protocol': 'https'});
ipfs.id((err, identity) => {
  if (err) throw err;
  console.log('IPFS address: ' + identity.id);
});

function addFileToIPFS(obj) {
    ipfsMini.addJSON(obj, (err, result) => {
        console.log(err, result);
        return result;
    });

}

function retrieveFileFromIPFS(multihash, callback) {
	ipfs.files.cat(multihash, function(err, stream) {
		if (err) throw err;
		stream.on('data', (file) => {
			callback(file);	
		});
	});

	/*
		 ipfsMini.catJSON(multihash, (err, result) => {
		 console.log(err, result);
		 console.log("JSON: " + result);
		 callback(result);
		 });
		 */
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
    ipfs.name.resolve(multihash, (err, result) => {
        if (err) {
            throw err;
        }
        callback(result.Path);
    });
}
