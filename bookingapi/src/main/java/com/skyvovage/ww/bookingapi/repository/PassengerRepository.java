package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for the passengers table.
 */
@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Integer> {
}
