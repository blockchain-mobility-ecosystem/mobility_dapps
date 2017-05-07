pragma solidity ^0.4.8;

import "./CarTypes.sol";
import "./ErrorTypes.sol";

contract MobilityRegistry is CarTypes, ErrorTypes {
    struct Account {
        address addr;
        bytes32 name;
        bytes16 license;
        bool exists;
    } 
   
    // State variables
    mapping (address => Account) drivers;
    mapping (address => Account) users;
    mapping (bytes17 => Car) cars;
    mapping (uint32 => Car) idToCar;

    uint32 curCarId;
    uint curRsvtNum;
    
    // Carpool events 
    event DriverRegistered(address account, bytes32 name);
    event CarRegistered(address account, bytes17 vin);
    event UserRegistered(address indexed account, bytes32 indexed name);

    function MobilityRegistry() { curCarId = 0; curRsvtNum = 0; }
    
    /// Regster as a driver.
    function registerDriver(bytes32 name, bytes16 license) returns(uint error) {
        Account driver = drivers[msg.sender];
        if (driver.exists) {
           return ACCOUNT_ALREADY_EXIST;
        } 

        driver.addr = msg.sender;
        driver.name = name;
        driver.license = license;
        driver.exists = true;
        drivers[msg.sender] = driver;
        DriverRegistered(msg.sender, name);
        return SUCCESS;
    }
  
    /// Register a car.
    function registerACar(bytes17 vin,
        uint16 year, 
        bytes32 make, 
        bytes32 model, 
        Color color, 
        Transmission transmission,
        uint8 seats
    ) returns(uint error) {
        Account driver = drivers[msg.sender];
        if (!driver.exists) {
            return ACCOUNT_NOT_EXIST;
        }

        Car car = cars[vin];
        if (car.exists) {
            return CAR_ALREADY_REGISTERED;
        }
        
        car.id = curCarId;
        curCarId += 1;
        car.vin = vin;
        car.owner = driver.addr;
        car.year = year;
        car.make = make;
        car.model = model;
        car.color = color;
        car.transmission = transmission;
        car.seats = seats;
        car.status = CarStatus.AVAILABLE;
        car.exists = true;

        cars[vin] = car; 
        idToCar[car.id] = car;

        CarRegistered(msg.sender, vin);
        return SUCCESS;
    }

    /// Register as user. 
    function registerUser(bytes32 name, bytes16 license) returns (uint error) {
        Account user = users[msg.sender];
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
