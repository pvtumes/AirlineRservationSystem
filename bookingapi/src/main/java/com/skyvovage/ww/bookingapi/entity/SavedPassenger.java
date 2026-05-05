package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * Maps to the saved_passengers table.
 */
@Data
@Entity
@Table(name = "saved_passengers")
public class SavedPassenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_pax_id")
    private Integer savedPaxId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;

    @Column(name = "relation")
    private String relation;

    @Column(name = "dob")
    private LocalDate dob;
}
