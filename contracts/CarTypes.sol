pragma solidity ^0.4.8;

contract CarTypes {
    enum Color { WHITE, BLACK, BLUE, RED}
    enum Transmission {MANUAL, AUTOMATIC}
    enum CarStatus {AVAILABLE, UNAVAILABLE}

    struct Car {
        uint32 id;
        bytes17 vin;
        address owner;
        uint16 year;
        bytes32 make;
        bytes32 model;
        Color color;
        Transmission transmission;
        uint8 seats;
        uint rsvt;
        CarStatus status;
        bool exists;
    }
}
