# Decentralized Mobility Application Framework

A decentralized mobility application framework on the ethereum blockchain.

The framework consists of two use cases / Dapps
- Carpool
- Car Sharing (which we're focusing on to deliver the dapp open framework for auto industries)

# Install

This dapp was built using the [Truffle Dapp Development Framework]. 
If you would like to deploy this dapp locally for testing the easiest way to do that is to install 
[Truffle] and the [testrpc Ethereum client].

## Car-servcie Dapp Prerequisites

Hardware
- Raspberry Pi (we use Pi 3)
- GPS Module
- Car Keyfob Bridge Circuit

Principle Software
- Raspbian Jessie (OS on Pi)
- js-ipfs
- truffle-contract
- web3

The "wrtc": "0.0.61" package is requred by the js-libp2p-webrtc-star-->js-libp2p-ipfs-browser-->js-ipfs.
We have forked `node-webrtc` repo for Pi. The official build not working on Pi since the 
`node-webrtc` library [issue](https://github.com/js-platform/node-webrtc/issues/152).

Follow the instructions in the [repo](https://github.com/Oaken-Innovations/node-webrtc) 
to install `node-webrtc` to your Pi.

Copy the generated "wrtc.node" to the following node_modules folder
"node_modules/wrtc/build/wrtc/v0.0.61/Release/node-v48-linux-arm/wrtc.node"

`npm install ipfs` again.

# Usage

You will need to be running testrpc in one terminal instance and Truffle in a second one. 
This can be accomplished by opening 2 separate terminal windows or using a program like `screen` 
if you use a Linux based OS. After installing Truffle and testrpc:


*Terminal Window 1:*

1. Start `testrpc` with settings to your liking (it is a good idea to unlock accounts 
when starting `testrpc` so you can more easily interact with the contracts).

*Terminal Window 2:*

2. Compile smart contracts

```Bash
truffle compile
```

3. Migrate contracts to testrpc or other chains.

```Bash
truffle migrate
```

4. Do some test

```Bash
truffle test test/carpool.js

```

5. Try in-car dapp

```Bash
cd app/carsharing/js
node carsharing-service.js
```
# TODO
- [ ] Demo GPS data sharing.
- [ ] Demo Dapp Unlock/Lock the car.

# License
Apache 2.0


[Truffle Dapp Development Framework]: http://truffleframework.com
[testrpc Ethereum client]: https://github.com/ethereumjs/testrpc
[Truffle]: http://truffleframework.com
