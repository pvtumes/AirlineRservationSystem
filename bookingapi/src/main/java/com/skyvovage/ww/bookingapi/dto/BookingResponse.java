package com.skyvovage.ww.bookingapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Top-level success response wrapper for POST /api/bookings.
 * Shape: { "success": true, "booking": { ... } }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private boolean success;
    private BookingDetails booking;
}
