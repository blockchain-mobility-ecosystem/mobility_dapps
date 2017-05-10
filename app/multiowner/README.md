# MultiOwnership Send and Play

A dapp that lets you own a (crypto) car by sending (ropsten) ether to the smart contract 
account, which will record you as one of the car owners on blockchain. Then you 
have the permission to unlock/lock the car by sending signed and dated `unlock`/`lock` message 
through http request to a M2M (machine-to-machine) relay server.

## How to play

### Create a ropsten testnet account and get some test ether.

####  Through MetaMask

One way to create a ropsten account and get some test ether is through [MetaMask].
Go and install their [chrome plugin][MetaMask chrome plugin]. Follow the instructions 
to create a in-browser node. After creating a ropsten testnet account, you can 
get some test ether by going to their [faucet](https://faucet.metamask.io/). The 
**ROPSTEN TEST FAUCET** button appears in the page after you press the **BUY** button 
of the chrome plugin.


### Prove your ownership

Next you need to prove your ownership by sending any amount of the ether you received for 
your new ropsten account to our smart contract at **0xae0d3e506ef19770477e974c50fabd3c1ecdd34b**. 
You can send ropsten ether from [MyEtherWallet](https://www.myetherwallet.com/) or 
directly from the MetaMask chrome plugin.

**Don't send your mainnet (real) ether to the account!**

### Play at our consensus booth

At the conference day, you can operate "your" (crypto) car at our booth. It's easy! 
Just send your *signed&dated* command (unlock/lock) to our relay server.

Here is how you sign and date your message with your ropsten account private key.

####  Sign command with myetherwallet

MyEtherWallet supports message signing and verifying using your ethereum account. 
Go to the [Sign Message] page and import your ropsten private key. You can see your 
private key by pressing the "Export Private Key" icon of your MetaMask plugin. Then put `lock`
or `unlock` to the "Message" field and put the current date (ex. May 9, 2017 16:24) to 
the "Date" field. Press the "Sign Message" button to generate the signed message with 
your signature and date.

#### Unlock/Lock the car

Now you can unlock/lock the car by *copy&paste* your *signed&dated* message from MyEtherWallet 
to append to the url `http://play.oakeninnovations.com/caraccess?signed=`.
Press **Enter** and see the magic!


[MetaMask]: https://metamask.io
[MetaMask chrome plugin]: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
[Sign Message]: https://www.myetherwallet.com/signmsg.html
