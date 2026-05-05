package com.skyvovage.ww.bookingapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when passengerList count != selectedSeats count.
 * Results in HTTP 400 Bad Request.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PassengerMismatchException extends RuntimeException {

    public PassengerMismatchException(String message) {
        super(message);
    }
}
