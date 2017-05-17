
const MQTT_BROKER_WS = 'ws://35.166.170.137:3000';
const TOPIC_CARSHARING = 'carsharing-car-commands-topic'; 

var client = mqtt.connect(MQTT_BROKER_WS);
client.on('connect', () => {
  console.log('connected');
});

function lock() {
  client.publish(TOPIC_CARSHARING, "lock");
}


function unlock() {
  client.publish(TOPIC_CARSHARING, "unlock");
}
