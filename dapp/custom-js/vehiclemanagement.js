
const MQTT_BROKER_WS = 'ws://35.166.170.137:3000';
const TOPIC_CARSHARING = 'carsharing-car-commands-topic'; 

//var web3;
var client = mqtt.connect(MQTT_BROKER_WS);

client.on('connect', () => {
  console.log('connected');
});
/*
function lock() {
  client.publish(TOPIC_CARSHARING, "lock");
}

function unlock() {
  client.publish(TOPIC_CARSHARING, "unlock");
}
*/

var tClient;
const CAR_NODE_ADDRESS = "0x47d20260d01093f26e0c863c992caa796d45c131";

web3.eth.getAccounts((err, accs) => {
  if (err) throw err;
  if (accs.length === 0) throw new Error("No eth accounts available!");
  var acc = accs[0];
  console.log('MQTTT is using eth account ' + acc);
  // TODO: Web3Signer only tested with testrpc, geth may not working with the `eth_sign` 
  // API change https://github.com/ethereum/go-ethereum/issues/3621
  tClient = new mqttt.MQTTT(acc, new mqttt.signers.Web3Signer(web3, 'hashPersonal', 'hashPersonal'), MQTT_BROKER_WS);

  tClient.listen(true, (err, msg) => {
    console.log(err, msg);
    if (err) throw err;
    var data = JSON.parse(msg.data);
    if (data.err) throw data.err;
    alert(data.result);
  });
});


function lock() {
  tClient.send(CAR_NODE_ADDRESS, 'lock', 'command');
}

function unlock() {
  tClient.send(CAR_NODE_ADDRESS, 'unlock', 'command');
}
