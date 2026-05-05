package com.skyvovage.ww.bookingapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Top-level success response for POST /api/saved-passengers/bulk.
 * Shape:
 * {
 *   "success": true,
 *   "message": "Passengers saved successfully",
 *   "savedCount": 2,
 *   "passengers": [ { "id": 1, "name": "..." }, ... ]
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedPassengerResponse {

    private boolean success;
    private String message;
    private int savedCount;
    private List<SavedPassengerResultDto> passengers;
}
