package com.skyvovage.ww.bookingapi.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Passenger sub-object used in both the request body and the response.
 */
@Data
public class PassengerDto {

    @NotBlank(message = "Passenger name is required")
    private String name;

    @NotNull(message = "Passenger age is required")
    @Min(value = 0, message = "Age must be non-negative")
    private Integer age;

    @NotBlank(message = "Passenger gender is required")
    private String gender;
}
