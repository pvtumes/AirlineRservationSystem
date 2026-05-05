package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Maps to the passengers table.
 */
@Data
@Entity
@Table(name = "passengers")
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "passenger_id")
    private Integer passengerId;

    @Column(name = "booking_id")
    private String bookingId;

    @Column(name = "name")
    private String name;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;
}
