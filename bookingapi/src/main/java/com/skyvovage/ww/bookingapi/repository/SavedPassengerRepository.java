package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.SavedPassenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for the saved_passengers table.
 * Uses saveAll() for bulk inserts with a single flush.
 */
@Repository
public interface SavedPassengerRepository extends JpaRepository<SavedPassenger, Integer> {
}
