package com.skyvovage.ww.bookingapi.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Maps to the meal_preference table.
 */
@Data
@Entity
@Table(name = "meal_preference")
public class MealPreference {

    /**
     * booking_id is the only key column for this table (no surrogate PK defined).
     * Using @Id here for JPA - each booking has one meal preference row.
     */
    @Id
    @Column(name = "booking_id")
    private String bookingId;

    @Column(name = "veg_count")
    private Integer vegCount;

    @Column(name = "nonveg_count")
    private Integer nonvegCount;
}
