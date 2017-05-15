pragma solidity ^0.4.10;

contract CarTypes {
    enum Color { WHITE, BLACK, BLUE, RED}
    enum Transmission {MANUAL, AUTOMATIC}
    enum CarStatus {AVAILABLE, UNAVAILABLE}

    struct Car {
        address owner;
        bytes IPNSAddr;
        CarStatus status;
        bool exists;
        uint currentRsvt;
    }

    uint constant CAR_ACCESS_UNLOCK = 1;
    uint constant CAR_ACCESS_LOCK = 2;
    uint constant CAR_ACCESS_REMOTE_START = 4;
    uint constant CAR_ACCESS_ALL = CAR_ACCESS_UNLOCK | CAR_ACCESS_LOCK | CAR_ACCESS_REMOTE_START;
}