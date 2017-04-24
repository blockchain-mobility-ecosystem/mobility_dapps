pragma solidity ^0.4.10

// Typedefs
using vin_t = bytes17;
using license_t = bytes16;
using carid_t = uint32;

// Error codes
uint constant SUCCESS = 0;
uint constant ACCOUNT_ALREADY_EXIST = 1;
uint constant ACCOUNT_NOT_EXIST = 2;

uint constant CAR_ALREADY_REGISTERED = 1000;
uint constant CAR_NOT_REGISTERED = 1001;
uint constant CAR_NOT_AVAILABLE = 1002;
uint constant ACCOUNT_NOT_AUTHORIZE_ACCESS_CAR = 1003;

