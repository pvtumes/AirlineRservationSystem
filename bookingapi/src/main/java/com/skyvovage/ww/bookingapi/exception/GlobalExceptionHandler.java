package com.skyvovage.ww.bookingapi.exception;

import com.skyvovage.ww.bookingapi.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Centralized exception handler for all controllers.
 * Returns the exact error response shape defined in the API spec.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── 409 Conflict: seat not available ──────────────────────────────────────

    @ExceptionHandler(SeatUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleSeatUnavailable(SeatUnavailableException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(ex.getMessage()));
    }

    // ─── 400 Bad Request: passenger count mismatch ─────────────────────────────

    @ExceptionHandler(PassengerMismatchException.class)
    public ResponseEntity<ErrorResponse> handlePassengerMismatch(PassengerMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(ex.getMessage()));
    }

    // ─── 400 Bad Request: @Valid bean validation failures ──────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(message));
    }

    // ─── 404: flight / schedule not found ──────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage()));
    }

    // ─── 400 Bad Request: manual validation (e.g. empty passenger list) ─────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(ex.getMessage()));
    }

    // ─── 500 Internal Server Error: failed bulk DB operation ───────────────────

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(ex.getMessage()));
    }

    // ─── 500: catch-all ────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("An unexpected error occurred: " + ex.getMessage()));
    }
}
