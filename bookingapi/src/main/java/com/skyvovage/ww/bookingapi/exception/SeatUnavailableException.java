package com.skyvovage.ww.bookingapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when one or more requested seats are already Booked.
 * Results in HTTP 409 Conflict.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SeatUnavailableException extends RuntimeException {

    public SeatUnavailableException(String message) {
        super(message);
    }
}
