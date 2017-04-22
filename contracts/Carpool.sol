pragma solidity ^0.4.10;

//import "CoMotionToken.sol"
import "./CarpoolTypes.sol"

/**
 * Carpool contract acts as carpool business layer.
 */
contract Carpool {
    enum Color { WHITE, BLACK, BLUE, RED}
    enum Transmission {MANUAL, AUTOMATIC}

    struct Car {
        carid_t id;
        vin_t vin;
        address owner;
        uint16 year;
        bytes32 make;
        bytes32 model;
        Color color;
        Transmission transmission;
        uint8 seats;
        Car next; // Link to next car;
        bool exists;
    }

    struct UserAccount {
        address addr;
        bytes32 name;
        license_t license;
        bool exists;
    } 
    
    // State variables
    mapping (address => UserAccount) drivers;
    mapping (address => UserAccount) users;
    mapping (vin_t => Car) cars;
    carid_t curCarid;
    
    // Carpool events 
    event DriverRegistered(address account, bytes32 name);
    event CarRegistered(address account, vin_t vin);
    event UserRegistered(address account, bytes32 name);

    /// @contructor
    function Carpool() {
        currCarId = 0;
    }
    
    /// Regster as a driver.
    function registerDriver(bytes32 name, license_t license) returns(uint error) {
        UserAccount driver = drivers[msg.sender];
        if (driver.exists) {
           return ACCOUNT_ALREADY_EXIST;
        } 

        driver.addr = msg.sender;
        driver.name = name;
        driver.licence = licence;
        driver.exists = true;
        drivers[msg.sender] = driver;

        DriverRegistered(msg.sender, name);
        return SUCCESS;
    }
  
    /// Register a car.
    function registerACar(address driver,
        vin_t vin,
        uint16 year, 
        bytes32 make, 
        bytes32 model, 
        Color color, 
        Transmission transmission,
        uint8 seats)
        returns(uint error)
    {
        UserAccount driver = drivers[msg.sender];
        if (!driver.exists) {
            return ACCOUNT_NOT_EXIST;
        }

        Car car = cars[vin];
        if (car.exists) {
            return CAR_ALREADY_REGISTERED;
        }
        
        car.id = curCarid;
        curCarid += 1;
        car.vin = vin;
        car.owner = driver.addr;
        car.year = year;
        car.make = make;
        car.model = model;
        car.color = color;
        car.transmission = transmission;
        car.seats = seats;
        car.exists = true;
        cars[msg.sender] = car; 

        CarRegistered(msg.sender, vin);
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
    
    /// Reserve a car with number of seats.
    function reserve(uint32 carId, uint8 numOfSeats) returns (bool) {
    }
    
    /// About to check out.
    function checkout() returns (bool) {
    }

    // Events related to car access authoriization
    event UnlockAuthorized(uint32 carId);
    event LockAuthorized(uint32 carId);

    function requestAuth2Unlock(uint32 carId) returns (uint token) {
    }

    function requestAuth2Lock(uint32 carId) returns (uint token) {
    }
    
}



