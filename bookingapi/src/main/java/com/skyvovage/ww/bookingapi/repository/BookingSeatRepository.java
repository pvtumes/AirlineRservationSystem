package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.BookingSeat;
import com.skyvovage.ww.bookingapi.entity.BookingSeatId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for the booking_seats join table.
 */
@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, BookingSeatId> {
}
