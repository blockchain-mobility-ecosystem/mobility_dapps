pragma solidity ^0.4.8;

import "./MobilityRegistry.sol";

contract CarSharing is MobilityRegistry {
    struct Reservation {
        address userCID;
        address carCID;
        uint start;
        uint end;
        bool exists;
    }

    mapping (uint => Reservation) reservations;
    uint curRsvtNum;

    event CarReserved(address userCID, address carCID);

    function CarSharing() { curRsvtNum = 0; }
    
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
    function checkPermission2AccessCar(address userCID) 
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

    /// About to check out.
    function checkout() returns (bool) {
    }
}
