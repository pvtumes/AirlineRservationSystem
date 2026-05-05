package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Maps to the bookings table.
 */
@Data
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @Column(name = "booking_id")
    private String bookingId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "schedule_id")
    private Integer scheduleId;

    /** 'Confirmed' | 'Pending' | 'Cancelled' */
    @Column(name = "status")
    private String status;

    @Column(name = "booking_time")
    private LocalDateTime bookingTime;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    /** 'Economy' | 'Business' | 'First' */
    @Column(name = "cabin_class")
    private String cabinClass;

    /** 'Pending' | 'Checked-in' */
    @Column(name = "checkin_status")
    private String checkinStatus;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;
}
