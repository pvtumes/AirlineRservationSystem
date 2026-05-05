package com.skyvovage.ww.bookingapi.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * A single passenger entry inside the bulk-save request.
 * All fields exactly mirror the saved_passengers table columns.
 */
@Data
public class SavedPassengerItemDto {

    @NotBlank(message = "Passenger name is required")
    private String name;

    @NotNull(message = "Passenger age is required")
    @Min(value = 0, message = "Age must be non-negative")
    private Integer age;

    @NotBlank(message = "Passenger gender is required")
    private String gender;

    // optional fields (nullable in DB)
    private String relation;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String email;

    private String phone;
}
