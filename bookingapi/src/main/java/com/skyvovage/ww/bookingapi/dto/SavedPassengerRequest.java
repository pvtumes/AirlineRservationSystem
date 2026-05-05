package com.skyvovage.ww.bookingapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Top-level request body for POST /api/saved-passengers/bulk.
 * Shape: { "userId": "...", "passengers": [...] }
 */
@Data
public class SavedPassengerRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotNull(message = "Passenger list cannot be empty")
    @NotEmpty(message = "Passenger list cannot be empty")
    @Valid
    private List<SavedPassengerItemDto> passengers;
}
