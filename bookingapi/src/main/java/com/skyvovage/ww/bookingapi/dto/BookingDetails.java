package com.skyvovage.ww.bookingapi.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * The "booking" object nested inside the success response.
 * Field names must match the JSON spec exactly.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetails {

    private String bookingRef;
    private String userId;
    private String flightId;
    private String cabinClass;
    private List<PassengerDto> passengers;
    private List<String> seats;
    private MealsDto meals;
    private PricingDto pricing;
    private String status;
    private String checkinStatus;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookedAt;
}
