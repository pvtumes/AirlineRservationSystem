package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the seats table.
 */
@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {

    /**
     * Find a seat by its seat_number and schedule_id combination.
     * Uses findFirst to avoid NonUniqueResultException if duplicate rows exist in the DB.
     */
    Optional<Seat> findFirstBySeatNumberAndScheduleId(String seatNumber, Integer scheduleId);

    /**
     * Fetch all seats for a specific schedule (for availability checks).
     */
    List<Seat> findByScheduleId(Integer scheduleId);
}
