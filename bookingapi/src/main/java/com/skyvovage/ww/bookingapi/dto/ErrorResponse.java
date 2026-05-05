package com.skyvovage.ww.bookingapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Top-level error response wrapper.
 * Shape: { "success": false, "error": "..." }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private boolean success;
    private String error;

    /** Convenience factory: success=false + message. */
    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message);
    }
}
