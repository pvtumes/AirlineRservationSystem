package com.skyvovage.ww.bookingapi.controller;

import com.skyvovage.ww.bookingapi.dto.BookingRequest;
import com.skyvovage.ww.bookingapi.dto.BookingResponse;
import com.skyvovage.ww.bookingapi.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the Booking API.
 * Endpoint: POST /api/bookings
 */
@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Creates a new flight booking.
     *
     * @param request validated booking request body
     * @return 201 Created with full booking details on success,
     *         or 400/409 error response (handled by GlobalExceptionHandler)
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request) {

        log.info("POST /api/bookings → userId={} flightId={} cabin={}",
                request.getUserId(), request.getFlightId(), request.getCabinClass());

        BookingResponse response = bookingService.createBooking(request);

        log.info("Booking created successfully → bookingRef={}",
                response.getBooking().getBookingRef());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
