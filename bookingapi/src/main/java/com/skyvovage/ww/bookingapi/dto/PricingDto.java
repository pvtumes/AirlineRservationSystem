package com.skyvovage.ww.bookingapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Pricing breakdown sub-object inside the booking response.
 * All amounts are in INR (integer, no decimals).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingDto {

    private long baseAmount;
    private long seatExtra;
    private long tax;
    private long totalAmount;
}
