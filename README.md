# Decentralized Mobility Application Framework

A decentralized mobility application framework.

The framework consists of in-car components/libs and user car sharing dapps.

# Install and run

This dapp was built using the [Truffle Dapp Development Framework]. 
If you would like to deploy this dapp locally for testing the easiest way to do that is to install 
[Truffle] and the [testrpc Ethereum client].


## Compile and install contracts.

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

## Run dapps

To run in-car dapp, go to *app/carsharing* to check out details.

To run user dapp, go to dapp to check out details.

# License
Apache 2.0


[Truffle Dapp Development Framework]: http://truffleframework.com
[testrpc Ethereum client]: https://github.com/ethereumjs/testrpc
[Truffle]: http://truffleframework.com
