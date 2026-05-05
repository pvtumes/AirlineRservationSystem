package com.skyvovage.ww.bookingapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request body for POST /api/bookings.
 * Field names must match the JSON spec exactly.
 */
@Data
public class BookingRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "flightId is required")
    private String flightId;

    @NotBlank(message = "cabinClass is required")
    private String cabinClass;

    @NotEmpty(message = "selectedSeats must not be empty")
    private List<String> selectedSeats;

    @NotEmpty(message = "passengerList must not be empty")
    @Valid
    private List<PassengerDto> passengerList;

    @NotNull(message = "meals is required")
    @Valid
    private MealsDto meals;
}
