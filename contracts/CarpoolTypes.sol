pragma solidity ^0.4.8;

contract CarpoolTypes {
    //typedef vin_t bytes17; 
    //typedef license_t bytes16;
    //typedef carid_t uint32;
    // Related to solidity issure: https://github.com/ethereum/solidity/issues/1100

    // Error codes
    uint constant SUCCESS = 0;
    uint constant ACCOUNT_ALREADY_EXIST = 1;
    uint constant ACCOUNT_NOT_EXIST = 2;

    uint constant CAR_ALREADY_REGISTERED = 1000;
    uint constant CAR_NOT_REGISTERED = 1001;
    uint constant CAR_NOT_AVAILABLE = 1002;
    uint constant ACCOUNT_NOT_AUTHORIZE_ACCESS_CAR = 1003;
}

