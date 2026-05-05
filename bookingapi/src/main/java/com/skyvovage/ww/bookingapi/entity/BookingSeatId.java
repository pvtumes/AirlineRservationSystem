package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite primary key for booking_seats table.
 */
@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class BookingSeatId implements Serializable {

    @Column(name = "booking_id")
    private String bookingId;

    @Column(name = "seat_id")
    private Integer seatId;
}
