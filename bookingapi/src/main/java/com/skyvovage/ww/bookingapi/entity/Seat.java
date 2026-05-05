package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Maps to the seats table.
 */
@Data
@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Integer seatId;

    @Column(name = "schedule_id")
    private Integer scheduleId;

    @Column(name = "seat_number")
    private String seatNumber;

    /**
     * 'Available' | 'Booked'
     */
    @Column(name = "seat_status")
    private String seatStatus;

    /**
     * 'Economy' | 'Business' | 'First'
     */
    @Column(name = "seat_class")
    private String seatClass;

    @Column(name = "extra_price", precision = 10, scale = 2)
    private BigDecimal extraPrice;
}
