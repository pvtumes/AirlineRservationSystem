package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Maps to the booking_seats join table.
 * Composite PK: (booking_id, seat_id)
 */
@Data
@Entity
@Table(name = "booking_seats")
public class BookingSeat {

    @EmbeddedId
    private BookingSeatId id;
}
