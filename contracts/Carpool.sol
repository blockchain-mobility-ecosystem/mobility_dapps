pragma solidity ^0.4.8;

//import "CoMotionToken.sol"
import "./MobilityRegistry.sol";

/**
 * Carpool contract acts as carpool business layer.
 */
contract Carpool is MobilityRegistry {
    struct Reservation {
        uint num;
        address customer;
        uint32 carId;
        uint start;
        uint end;
        bool exists;
    }
    mapping (uint => Reservation) reservations;
    event CarReserved(uint32 carId, address customer);
       
    /// Reserve a car with number of seats.
    function reserve(uint32 carId, 
        uint8 numOfSeats,
        uint start,
        uint end
    ) returns (uint error) {
        Account user = users[msg.sender];
        if (!user.exists) return ACCOUNT_NOT_EXIST;

        Car car = idToCar[carId];
        if (!car.exists) return CAR_NOT_REGISTERED;

        if (car.status == CarStatus.UNAVAILABLE) return CAR_NOT_AVAILABLE;

        Reservation rsvt = reservations[curRsvtNum];
        rsvt.num = curRsvtNum;
        curRsvtNum += 1;
        rsvt.customer = user.addr;
        rsvt.carId = carId;
        rsvt.start = start;
        rsvt.end = end;
        rsvt.exists = true;
        reservations[rsvt.num] = rsvt;
        car.rsvt = rsvt.num;

        CarReserved(carId, user.addr);
        return SUCCESS;
    }
    /// About to check out.
    function checkout() returns (bool) {
    }

}



