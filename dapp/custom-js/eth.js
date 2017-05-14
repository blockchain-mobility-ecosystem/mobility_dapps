var web3, ethAccount;
var CarShareContract;
var ethAccount = '0x0';

// Checking if Web3 has been injected by the browser (Mist/MetaMask)
if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
    console.log("Current provider: " + web3.currentProvider);
} else {
    console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

//ethAccount = web3.eth.defaultAccount;

// Now you can start your app & access web3 freely:
startApp();


function startApp() {
    var CarShareABI = (
        [{ "constant": false, "inputs": [], "name": "checkout", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "cid", "type": "address" }], "name": "listCar", "outputs": [{ "name": "error", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "userAddress", "type": "address" }], "name": "retrieveUserInfo", "outputs": [{ "name": "name", "type": "bytes32" }, { "name": "license", "type": "bytes16" }, { "name": "exists", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "masterList", "outputs": [{ "name": "", "type": "bytes" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "carCID", "type": "address" }, { "name": "start", "type": "uint256" }, { "name": "end", "type": "uint256" }], "name": "reserve", "outputs": [{ "name": "error", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "cid", "type": "address" }], "name": "retrieveCarInfo", "outputs": [{ "name": "status", "type": "uint8" }, { "name": "owner", "type": "address" }, { "name": "exists", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "userCID", "type": "address" }], "name": "checkPermission2AccessCar", "outputs": [{ "name": "error", "type": "uint256" }, { "name": "permission", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "name", "type": "bytes32" }, { "name": "license", "type": "bytes16" }], "name": "registerUser", "outputs": [{ "name": "error", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "inputList", "type": "bytes" }], "name": "updateMasterList", "outputs": [{ "name": "error", "type": "uint256" }], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "userCID", "type": "address" }, { "indexed": false, "name": "carCID", "type": "address" }], "name": "CarReserved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "account", "type": "address" }, { "indexed": true, "name": "name", "type": "bytes32" }], "name": "UserRegistered", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "userAccount", "type": "address" }, { "indexed": false, "name": "carAccount", "type": "address" }], "name": "CarListed", "type": "event" }]
    );
    var CarShareAddress = "0x71002355e8ff8615ce4665f9eb4f2F9E87f8f858";

    CarShareContract = web3.eth.contract(CarShareABI).at(CarShareAddress);
    accountChoiceLoad();
}

function accountChoiceLoad() {
    var accounts = web3.eth.accounts;

    var selectAcct = document.getElementById("acctSelect");

    // Collect all of the accounts from your Ethereum node you are connected to.
    // NOTE: If you are not using testrpc, you may need to add some things here
    // in order to unlock the accounts we are collecting.
    for (var i = 0; i < accounts.length; i++) {
        var acct = accounts[i];
        var el = document.createElement("option");
        el.textContent = acct;
        el.value = acct;
        selectAcct.appendChild(el);
    }

    // Set the default accounts to be displayed.
    if (!retrieveValue('defaultAccount')) {
        selectAcct.selectedIndex = "0";
        web3.eth.defaultAccount = accounts[0];
    } else {
        web3.eth.defaultAccount = retrieveValue('defaultAccount');
    }
    displayAccountInfo(web3.eth.defaultAccount);
}

function displayAccountInfo() {
    console.log("In displayAccountInfo()");
    var userData = getUserDetails(web3.eth.defaultAccount);
    var icon = document.getElementById('icon');
    icon.style.backgroundImage = 'url(' + blockies.create({ seed: web3.eth.defaultAccount, size: 15, scale: 3 }).toDataURL() + ')';
    if (userData.exists) {
        document.getElementById('user-info').innerHTML = '<a href=https://ropsten.etherscan.io/address/' + web3.eth.defaultAccount +
            ' &quot; target=&quot;_blank&quot;>' + web3.eth.defaultAccount.substring(0, 10) + '...</a><br>' + web3.toAscii(userData.name);
        icon.style.backgroundImage = 'url(' + blockies.create({ seed: web3.eth.defaultAccount, size: 15, scale: 3 }).toDataURL() + ')';
    } else {
        document.getElementById('user-info').innerHTML = '<a href=https://ropsten.etherscan.io/address/"' + web3.eth.defaultAccount +
            ' &quot; target=&quot;_blank&quot;>' + web3.eth.defaultAccount.substring(0, 10) + '...</a><br><a data-toggle="modal" href="#myModal">Set Up Account</a>';
    }
}

function accountManagementModal() {
    var selectAcct = document.getElementById("acctSelect");
    var userData = getUserDetails(selectAcct.options[selectAcct.selectedIndex].text);
    console.log("Account selected: " + selectAcct.options[selectAcct.selectedIndex].text);
    if (userData.exists) {
        document.getElementById("name").value = web3.toAscii(userData.name);
        document.getElementById("driversLicense#").value = web3.toAscii(userData.license);
    } else {
        document.getElementById("name").value = "";
        document.getElementById("driversLicense#").value = "";
    }
    return;
}


function saveAccountDefault() {
    var selectAcct = document.getElementById("acctSelect");
    var dropDownValue = selectAcct.options[selectAcct.selectedIndex].text;
    storeValue('defaultAccount', dropDownValue);
    web3.eth.defaultAccount = dropDownValue;
    console.log("new value: " + web3.eth.defaultAccount);
    displayAccountInfo(dropDownValue);
    return;
}

function getUserDetails(address) {
    try {
        var result = CarShareContract.retrieveUserInfo(address);
        var userDataJSON = {
            'name': result[0],
            'license': result[1],
            'exists': result[2]
        };
        return userDataJSON;
    } catch (err) {
        console.log(err);
    }
}

function updateGlobalFile(multiaddress) {
    try {
        var result = CarShareContract.updateMasterList(multiaddress, { from: web3.eth.defaultAccount, gas: 1800000 });
        return result;
    } catch (err) {
        console.log(err);
    }
}

function retrieveGlobalFile() {
    try {
        var multiaddress = CarShareContract.masterList();
        console.log("global file from ipfs retrieved is: " + web3.toAscii(multiaddress));
        var result = retrieveFileFromIPFS(web3.toAscii(multiaddress));
        return web3.toAscii(multiaddress);
    } catch (err) {
        console.log(err);
    }
}

function getVehicleDetails(CID) {
    try {
        var result = CarShareContract.retrieveCarInfo(CID);
        console.log("Car Data: " + result)
    } catch (err) {
        console.log(err);
    }
}

function registerUser() {
    try {
        var selectAcct = document.getElementById("acctSelect");
        var result = CarShareContract.registerUser(
            document.getElementById("name").value,
            document.getElementById("driversLicense#").value, { from: selectAcct.options[selectAcct.selectedIndex].text, gas: 1800000 });
        console.log("User Registration Transaction Hash: " + result)
        console.log("Transaction Hash: " + result);
        document.getElementById("registerUserResults").innerHTML =
            "<a href=https://ropsten.etherscan.io/tx/" + result + " &quot; target=&quot;_blank&quot;>Registration Sent!</a>";
    } catch (err) {
        console.log(err);
        document.getElementById("registerUserResults").innerHTML = err;
    }
}

function registerVehicle() {
    try {
        var transDropDown = document.getElementById("transmission");

        var result = CarShareContract.listCar(
            //document.getElementById("cryptoID#").value, 
            "0x3b7F58B6ae8643Dac0ac16560B7B38991Cdec338",
            document.getElementById("VIN").value,
            document.getElementById("year").value,
            document.getElementById("make").value,
            document.getElementById("model").value,
            4,
            //  document.getElementById("color").value, // TODO It is an enum. Will deal with later.
            web3.toDecimal(document.getElementById("availableEmptySeats").value),
            web3.toDecimal(transDropDown.options[transDropDown.selectedIndex].id), { from: web3.eth.defaultAccount, gas: 1800000 });
        console.log("Vehicle Registration Transaction Hash: " + result);
        document.getElementById("registerVehicleResults").innerHTML =
            "<a href=https://ropsten.etherscan.io/tx/" + result + " &quot; target=&quot;_blank&quot;>Registration Sent!</a>";

    } catch (err) {
        console.log(err);
    }
}
