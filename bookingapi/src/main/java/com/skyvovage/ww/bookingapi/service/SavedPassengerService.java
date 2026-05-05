package com.skyvovage.ww.bookingapi.service;

import com.skyvovage.ww.bookingapi.dto.SavedPassengerItemDto;
import com.skyvovage.ww.bookingapi.dto.SavedPassengerRequest;
import com.skyvovage.ww.bookingapi.dto.SavedPassengerResponse;
import com.skyvovage.ww.bookingapi.dto.SavedPassengerResultDto;
import com.skyvovage.ww.bookingapi.entity.SavedPassenger;
import com.skyvovage.ww.bookingapi.repository.SavedPassengerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for bulk-saving passengers into the saved_passengers table.
 *
 * <p>The entire insert batch runs inside a single @Transactional context.
 * If any insert fails, the whole transaction is rolled back automatically.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SavedPassengerService {

    private final SavedPassengerRepository savedPassengerRepository;

    /**
     * Validates and bulk-inserts all passengers for a given user.
     *
     * @param request validated request containing userId + passenger list
     * @return success response with generated IDs and names
     * @throws IllegalArgumentException if passengers list is empty
     * @throws RuntimeException         if any DB insert fails (triggers rollback)
     */
    @Transactional
    public SavedPassengerResponse bulkSave(SavedPassengerRequest request) {

        // ── Validate passenger list is not empty ────────────────────────────────
        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new IllegalArgumentException("Passenger list cannot be empty");
        }

        log.info("Bulk saving {} passenger(s) for userId={}",
                request.getPassengers().size(), request.getUserId());

        // ── Map DTOs → Entities ─────────────────────────────────────────────────
        List<SavedPassenger> entities = new ArrayList<>();
        for (SavedPassengerItemDto dto : request.getPassengers()) {
            SavedPassenger entity = new SavedPassenger();
            entity.setUserId(request.getUserId());
            entity.setName(dto.getName());
            entity.setAge(dto.getAge());
            entity.setGender(dto.getGender());
            entity.setRelation(dto.getRelation());
            entity.setDob(dto.getDob());
            entity.setEmail(dto.getEmail());
            entity.setPhone(dto.getPhone());
            entities.add(entity);
        }

        // ── Bulk insert (single transaction) ────────────────────────────────────
        List<SavedPassenger> saved;
        try {
            saved = savedPassengerRepository.saveAll(entities);
            log.info("Successfully saved {} passenger(s)", saved.size());
        } catch (Exception ex) {
            log.error("Failed to save passengers for userId={}: {}", request.getUserId(), ex.getMessage());
            throw new RuntimeException("Failed to save passengers");
        }

        // ── Build response ───────────────────────────────────────────────────────
        List<SavedPassengerResultDto> results = saved.stream()
                .map(p -> new SavedPassengerResultDto(p.getSavedPaxId(), p.getName()))
                .toList();

        return SavedPassengerResponse.builder()
                .success(true)
                .message("Passengers saved successfully")
                .savedCount(results.size())
                .passengers(results)
                .build();
    }
}
