
exports.MQTTTopics = {
    CAR_COMMANDS_CARSHARING: 'carsharing-car-commands-topic',
    CAR_COMMANDS_MULTIOWNER: 'multiowner-car-commands-topic'
}

exports.Configs = {
    MQTT_Broker_TCP: 'tcp://35.166.170.137:1883',
    MQTT_BROKER_WS: 'ws://35.166.170.137:3000',
    IPFS_Bootstrap_Peers: [
        '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd'
    ]
}

exports.Artifacts = {
    CarSharing: require('../../../build/contracts/CarSharing.json'),
    MultiOwnership: require('../../../build/contracts/MultiOwnership.json')
}


exports.hdconfig = require('../../../hdconfig.json');
