package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for the bookings table.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    /**
     * Finds the highest numeric booking ID so the service can generate the next one.
     * Booking IDs follow the pattern "B001", "B002", etc.
     */
    @Query("SELECT MAX(b.bookingId) FROM Booking b")
    Optional<String> findMaxBookingId();
}
