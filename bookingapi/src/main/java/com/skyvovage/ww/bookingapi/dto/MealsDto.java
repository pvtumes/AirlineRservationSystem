package com.skyvovage.ww.bookingapi.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Meals sub-object. Field names (veg / nonVeg) must match JSON spec exactly.
 */
@Data
public class MealsDto {

    @NotNull(message = "veg count is required")
    @Min(value = 0, message = "veg count must be non-negative")
    private Integer veg;

    @NotNull(message = "nonVeg count is required")
    @Min(value = 0, message = "nonVeg count must be non-negative")
    private Integer nonVeg;
}
