pragma solidity ^0.4.8;

import "./CarTypes.sol";
import "./ErrorTypes.sol";

contract MobilityRegistry is CarTypes, ErrorTypes {
    struct UserAccount {
        address addr;
        bytes32 name;
        bytes16 license;
        uint8 carsListed;
        bool exists;
    } 
   
    mapping (address => UserAccount) users;
    mapping (address => Car) cars;
    
    event UserRegistered(address indexed account, bytes32 indexed name);
    event CarListed(address userAccount, address carAccount);
    
    /// Register a car.
    function listCar(address cid, // cid = Crypto ID
        bytes17 vin,
        uint16 year, 
        bytes32 make, 
        bytes32 model, 
        Color color, 
        Transmission transmission,
        uint8 seats
    ) returns(uint error) {
        UserAccount user = users[msg.sender];
        if (!user.exists) {
            return ACCOUNT_NOT_EXIST;
        }

        Car car = cars[cid];
        if (car.exists) {
            return CAR_ALREADY_REGISTERED;
        }
         
        car.vin = vin;
        car.owner = msg.sender;
        car.year = year;
        car.make = make;
        car.model = model;
        car.color = color;
        car.transmission = transmission;
        car.seats = seats;
        car.status = CarStatus.AVAILABLE;
        car.exists = true;
        user.carsListed += 1;

        CarListed(msg.sender, cid);
        return SUCCESS;
    }

    /// Register as user. 
    function registerUser(bytes32 name, bytes16 license) returns (uint error) {
        UserAccount user = users[msg.sender];
        if (user.exists) {
            return ACCOUNT_ALREADY_EXIST;
        }

        user.addr = msg.sender;
        user.name = name;
        user.license = license;
        user.exists = true;
        users[msg.sender] = user;

        UserRegistered(user.addr, name);
        return SUCCESS;
    }
}
