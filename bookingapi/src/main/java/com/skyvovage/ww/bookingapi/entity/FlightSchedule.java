package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Maps to the flight_schedule table.
 */
@Data
@Entity
@Table(name = "flight_schedule")
public class FlightSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer scheduleId;

    @Column(name = "flight_id")
    private String flightId;

    @Column(name = "travel_date")
    private LocalDate travelDate;

    @Column(name = "total_seats")
    private Integer totalSeats;

    @Column(name = "available_seats")
    private Integer availableSeats;

    @Column(name = "departure_time")
    private LocalTime departureTime;

    @Column(name = "arrival_time")
    private LocalTime arrivalTime;

    @Column(name = "base_price_economy", precision = 10, scale = 2)
    private BigDecimal basePriceEconomy;

    @Column(name = "base_price_business", precision = 10, scale = 2)
    private BigDecimal basePriceBusiness;
}
