pragma solidity ^0.4.8;

contract MultiOwnership {
    mapping(address => bool) owners;
    address carAccount;

    event DepositReceived(address account);

    function MultiOwnership() {
        carAccount = msg.sender;
    } 
    
    function isOwner(address user) returns (bool owned) {
        return owners[user];
    }

    function() payable {
        bool exist = owners[msg.sender];
        if (!exist) {
            owners[msg.sender] = true;
        }
        DepositReceived(msg.sender);
    }


}
