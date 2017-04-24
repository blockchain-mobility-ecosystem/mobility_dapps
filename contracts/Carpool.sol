pragma solidity ^0.4.10;

//import "CoMotionToken.sol"
import "./CarpoolTypes.sol"

/**
 * Carpool contract acts as carpool business layer.
 */
contract Carpool {
    enum Color { WHITE, BLACK, BLUE, RED}
    enum Transmission {MANUAL, AUTOMATIC}
    enum CarStatus {AVAILABLE, UNAVAILABLE}

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
        uint rsvt;
        Car next; // Link to next car;
        bool exists;
    }

    struct Account {
        address addr;
        bytes32 name;
        license_t license;
        bool exists;
    } 

    struct Reservation {
        uint num;
        address customer;
        carid_t carId;
        uint start;
        uint end;
        bool exists;
    }
    
    // State variables
    mapping (address => Account) drivers;
    mapping (address => Account) users;
    mapping (vin_t => Car) cars;
    mapping (carid_t => Car) idToCar;
    mapping (uint => Reservation) reservations;

    carid_t curCarid;
    uint curRsvtNum;
    
    // Carpool events 
    event DriverRegistered(address account, bytes32 name);
    event CarRegistered(address account, vin_t vin);
    event UserRegistered(address account, bytes32 name);
    event CarReserved(carid_t carId, address customer);

    /// @contructor
    function Carpool() {
        curCarId = 0;
        curRsvtNum = 0;
    }
    
    /// Regster as a driver.
    function registerDriver(bytes32 name, license_t license) returns(uint error) {
        Account driver = drivers[msg.sender];
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
        Account driver = drivers[msg.sender];
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
        car.status = CarStatus.AVAILABLE;
        car.exists = true;

        cars[msg.sender] = car; 
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
    
    /// Reserve a car with number of seats.
    function reserve(uint32 carId, 
        uint8 numOfSeats,
        uint start,
        uint end,
    ) 
        returns (uint error, 
        uint reservationNum
    ) 
    {
        Account user = users[msg.sender];
        if (!user.exists) return (ACCOUNT_NOT_EXIST, 0);

        Car car = idToCar(carId);
        if (!car.exists) return (CAR_NOT_REGISTERED, 0);

        if (car.status == CarStatus.UNAVAILABLE) return (CAR_NOT_AVAILABLE, 0);

        Reservation rsvt = reservations[curRsvtNum];
        rsvt.num = curRsvtNum;
        curRsvtNum += 1;
        rsvt.customer = user.addr;
        rsvt.carId = carId;
        rsvt.start = start;
        rsvt.end = end;
        rsvt.exist = true;
        reservations[rsvt.num] = rsvt;
        car.rsvt = rsvt.num;

        CarReserved(carid, user.addr);
        return (SUCCESS, rsvt.num);
    }
    
    /// About to check out.
    function checkout() returns (bool) {
    }

    // Events related to car access authoriization
    event UnlockAuthorized(uint32 carId, address user);
    event LockAuthorized(uint32 carId, address user);

    function requestAuth2Unlock(uint32 carId) returns (uint error, uint token) {
        Account user = users[msg.sender];
        if (!user.exists) {
            return (ACCOUNT_NOT_EXIST, 0);
        }
        
        Car car = idToCar[carId];
        Reservation rsvt = reservations[car.rsvt];
        if (rsvt.customer != user.addr) {
            return (ACCOUNT_NOT_AUTORIZE_ACCESS_CAR, 0);
        }
        // TODO: generate token for car access.
        UnlockAuthorized(carId, user.addr);
        return (SUCCESS, 0);
    }

    function requestAuth2Lock(uint32 carId) returns (uint token) {
        Account user = users[msg.sender];
        if (!user.exists) {
            return (ACCOUNT_NOT_EXIST, 0);
        }
        
        Car car = idToCar[carId];
        Reservation rsvt = reservations[car.rsvt];
        if (rsvt.customer != user.addr) {
            return (ACCOUNT_NOT_AUTORIZE_ACCESS_CAR, 0);
        }
        // TODO: generate token for car access.
        LockAuthorized(carId, user.addr);
        return (SUCCESS, 0);
    }
    
}



