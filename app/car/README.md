# In-car Service 

It's can be used as a library to provide in-car decentralized services including
- Decentralized data service `ipfs`
- M2M communication `MQTT`
- Car data (GPS, door status, speed, etc.)
- Car control (unlock/lock car)

## APIs
- car = new CarService()
- car.startIpfsApi(callback)
- car.startIpfs(repo, callback), *not working with ipns apis*.
- car.startGPSData()
- car.listenCarTopic(M2MProtocol, topic, msgReceiver, callback)
- car.execCmd(command)
- car.stopService()
