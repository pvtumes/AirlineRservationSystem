package com.skyvovage.ww.bookingapi.controller;

import com.skyvovage.ww.bookingapi.dto.SavedPassengerRequest;
import com.skyvovage.ww.bookingapi.dto.SavedPassengerResponse;
import com.skyvovage.ww.bookingapi.service.SavedPassengerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for saved-passengers operations.
 * Endpoint: POST /api/saved-passengers/bulk
 */
@Slf4j
@RestController
@RequestMapping("/api/saved-passengers")
@RequiredArgsConstructor
public class SavedPassengerController {

    private final SavedPassengerService savedPassengerService;

    /**
     * Bulk-saves multiple passengers for a user.
     *
     * @param request validated request body
     * @return 201 Created with success response on insert,
     *         or 400/500 error response (handled by GlobalExceptionHandler)
     */
    @PostMapping("/bulk")
    public ResponseEntity<SavedPassengerResponse> bulkSave(
            @Valid @RequestBody SavedPassengerRequest request) {

        log.info("POST /api/saved-passengers/bulk → userId={}, count={}",
                request.getUserId(),
                request.getPassengers() != null ? request.getPassengers().size() : 0);

        SavedPassengerResponse response = savedPassengerService.bulkSave(request);

        log.info("Bulk save complete → savedCount={}", response.getSavedCount());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
