
exports.MQTTTopics = {
    CAR_COMMANDS: 'car-commands-topic'
}

exports.Configs = {
    MQTT_Broker_URL: 'tcp://35.166.170.137:1883',
    IPFS_Bootstrap_Peers: [
        '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd'
    ]
}

exports.Artifacts = {
    CarSharing: require('../../../build/contracts/CarSharing.json')
}


exports.hdconfig = require('../../../hdconfig.json');
