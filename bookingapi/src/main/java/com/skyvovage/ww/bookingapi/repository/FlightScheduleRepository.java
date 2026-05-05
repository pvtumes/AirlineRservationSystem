package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.FlightSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for flight_schedule table.
 */
@Repository
public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, Integer> {

    /**
     * Fetch the latest (first by schedule_id) schedule for the given flight.
     * In production you would also filter by travel_date.
     */
    Optional<FlightSchedule> findFirstByFlightIdOrderByScheduleIdDesc(String flightId);
}
