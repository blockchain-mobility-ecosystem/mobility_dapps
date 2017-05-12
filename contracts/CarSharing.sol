pragma solidity ^0.4.10;

import "./MobilityRegistry.sol";

contract CarSharing is MobilityRegistry {
    struct Reservation {
        address userCID;
        address carCID;
        uint start; // Epoch time.
        uint end;   // Epoch time.
        bool exists;
    }

    mapping (uint => Reservation) reservations;
    uint curRsvtNum;

    event CarReserved(address userCID, address carCID);

    function CarSharing() { curRsvtNum = 0; }
    
    bytes public masterList;
    
    // Display availability status.
    function updateMasterList(bytes inputList) returns (uint error) {
        if(!users[msg.sender].exists) {
           return ACCOUNT_NOT_EXIST; 
        }
        masterList = inputList;
    }
    
    /// Reserve a car
    function reserve(address carCID, 
        uint start,
        uint end
    ) returns (uint error) {
        UserAccount user = users[msg.sender];
        if (!user.exists) return ACCOUNT_NOT_EXIST;

        Car car = cars[carCID];
        if (!car.exists) return CAR_NOT_REGISTERED;

        if (car.status == CarStatus.UNAVAILABLE) return CAR_NOT_AVAILABLE;

        Reservation rsvt = reservations[curRsvtNum];
        rsvt.userCID= msg.sender;
        rsvt.carCID = carCID;
        rsvt.start = start;
        rsvt.end = end;
        rsvt.exists = true;
        reservations[curRsvtNum] = rsvt;
        car.currentRsvt = curRsvtNum;
        curRsvtNum += 1;

        CarReserved(msg.sender, carCID);
        return SUCCESS;
    }

    /// Car node to check user's pemission to access (lock/unlock) the car.
    function checkPermission2AccessCar (address userCID) constant
            returns (uint error, uint permission) 
    {
        Car car = cars[msg.sender];
        if (!car.exists) return (CAR_NOT_REGISTERED, 0);

        UserAccount user = users[msg.sender];
        if (!user.exists) {
            return (ACCOUNT_NOT_EXIST, 0);
        }
        
        Reservation rsvt = reservations[car.currentRsvt];
        if (rsvt.userCID != userCID) {
            return (SUCCESS, CAR_ACCESS_ALL);
        } else {
            return (SUCCESS, CAR_ACCESS_ALL);
        }
    }
    /// Retrieve details about a user.
    function retrieveUserInfo(address userAddress) constant returns (bytes32 name, 
    bytes16 license, 
    bool exists) {
        UserAccount RequestedUserAccount = users[userAddress];
        name = RequestedUserAccount.name;
        license = RequestedUserAccount.license;
        exists = RequestedUserAccount.exists;
    }
    
    /// Retrieve details about the vehicle status and existence.
    function retrieveCarInfo(address cid) constant returns (CarStatus status, 
    address owner, 
    bool exists) {
        Car RequestedCar = cars[cid];
        status = RequestedCar.status;
        exists = RequestedCar.exists;
        owner =  RequestedCar.owner;
    }

    /// About to check out.
    function checkout() returns (bool) {
    }
}