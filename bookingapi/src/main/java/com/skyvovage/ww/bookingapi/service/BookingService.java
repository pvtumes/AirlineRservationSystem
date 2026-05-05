package com.skyvovage.ww.bookingapi.service;

import com.skyvovage.ww.bookingapi.dto.*;
import com.skyvovage.ww.bookingapi.entity.*;
import com.skyvovage.ww.bookingapi.exception.PassengerMismatchException;
import com.skyvovage.ww.bookingapi.exception.ResourceNotFoundException;
import com.skyvovage.ww.bookingapi.exception.SeatUnavailableException;
import com.skyvovage.ww.bookingapi.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core booking service.
 * All DB operations run inside a single transaction — any failure triggers a full rollback.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    // ─── Price constants ────────────────────────────────────────────────────────
    private static final BigDecimal VEG_MEAL_PRICE    = new BigDecimal("200");
    private static final BigDecimal NON_VEG_MEAL_PRICE = new BigDecimal("300");
    private static final BigDecimal TAX_RATE          = new BigDecimal("0.12");

    // ─── Repositories ───────────────────────────────────────────────────────────
    private final FlightScheduleRepository flightScheduleRepository;
    private final SeatRepository           seatRepository;
    private final BookingRepository        bookingRepository;
    private final BookingSeatRepository    bookingSeatRepository;
    private final PassengerRepository      passengerRepository;
    private final MealPreferenceRepository mealPreferenceRepository;

    // ───────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Creates a complete flight booking.
     *
     * <p>Steps (all within one transaction):
     * <ol>
     *   <li>Validate passenger count == seat count</li>
     *   <li>Resolve flight_schedule from flight_id</li>
     *   <li>Validate every requested seat is 'Available'</li>
     *   <li>Compute pricing</li>
     *   <li>Persist: booking → passengers → booking_seats → seat status update → meal_preference</li>
     *   <li>Build and return response</li>
     * </ol>
     *
     * @param request validated booking request
     * @return complete {@link BookingResponse}
     * @throws PassengerMismatchException when passenger count ≠ seat count
     * @throws SeatUnavailableException   when any seat is not 'Available'
     * @throws ResourceNotFoundException  when flightId has no schedule
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {

        // ── Step 1: Validate passenger count matches selected seats ─────────────
        if (request.getPassengerList().size() != request.getSelectedSeats().size()) {
            throw new PassengerMismatchException(
                    "Passenger count must match number of selected seats");
        }

        // ── Step 2: Resolve schedule_id from flight_id ──────────────────────────
        log.info("Fetching schedule for flightId={}", request.getFlightId());
        FlightSchedule schedule = flightScheduleRepository
                .findFirstByFlightIdOrderByScheduleIdDesc(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No schedule found for flightId: " + request.getFlightId()));

        Integer scheduleId = schedule.getScheduleId();
        log.info("Resolved scheduleId={}", scheduleId);

        // ── Step 3: Get base price based on cabin class ─────────────────────────
        BigDecimal basePrice = resolveBasePrice(schedule, request.getCabinClass());

        // ── Step 4: Fetch each seat & validate availability ─────────────────────
        List<Seat> resolvedSeats = new ArrayList<>();
        for (String seatNumber : request.getSelectedSeats()) {
            Seat seat = seatRepository
                    .findFirstBySeatNumberAndScheduleId(seatNumber, scheduleId)
                    .orElseThrow(() -> new SeatUnavailableException(
                            "One or more selected seats are no longer available"));

            if (!"Available".equalsIgnoreCase(seat.getSeatStatus())) {
                log.warn("Seat {} is not available (status={})", seatNumber, seat.getSeatStatus());
                throw new SeatUnavailableException(
                        "One or more selected seats are no longer available");
            }
            resolvedSeats.add(seat);
        }

        // ── Step 5: Compute pricing ─────────────────────────────────────────────
        PricingDto pricing = computePricing(
                basePrice,
                resolvedSeats,
                request.getPassengerList().size(),
                request.getMeals());

        // ── Step 6: Generate booking ID ─────────────────────────────────────────
        String bookingId = generateNextBookingId();
        log.info("Generated bookingId={}", bookingId);

        LocalDateTime now = LocalDateTime.now();

        // ── Step 7a: Insert into bookings ───────────────────────────────────────
        Booking booking = new Booking();
        booking.setBookingId(bookingId);
        booking.setUserId(request.getUserId());
        booking.setScheduleId(scheduleId);
        booking.setStatus("Confirmed");
        booking.setBookingTime(now);
        booking.setTotalAmount(BigDecimal.valueOf(pricing.getTotalAmount()));
        booking.setTaxAmount(BigDecimal.valueOf(pricing.getTax()));
        booking.setCabinClass(request.getCabinClass());
        booking.setCheckinStatus("Pending");
        bookingRepository.save(booking);
        log.info("Saved booking row for bookingId={}", bookingId);

        // ── Step 7b: Insert passengers ──────────────────────────────────────────
        for (PassengerDto pDto : request.getPassengerList()) {
            Passenger passenger = new Passenger();
            passenger.setBookingId(bookingId);
            passenger.setName(pDto.getName());
            passenger.setAge(pDto.getAge());
            passenger.setGender(pDto.getGender());
            passengerRepository.save(passenger);
        }
        log.info("Saved {} passenger(s)", request.getPassengerList().size());

        // ── Step 7c: Insert booking_seats & 7d: update seat status to 'Booked' ──
        for (Seat seat : resolvedSeats) {
            // Insert booking_seat link
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setId(new BookingSeatId(bookingId, seat.getSeatId()));
            bookingSeatRepository.save(bookingSeat);

            // Mark seat as Booked
            seat.setSeatStatus("Booked");
            seatRepository.save(seat);
        }
        log.info("Saved booking_seats and updated seat statuses to 'Booked'");

        // ── Step 7e: Insert meal_preference ────────────────────────────────────
        MealPreference meal = new MealPreference();
        meal.setBookingId(bookingId);
        meal.setVegCount(request.getMeals().getVeg());
        meal.setNonvegCount(request.getMeals().getNonVeg());
        mealPreferenceRepository.save(meal);
        log.info("Saved meal preference");

        // ── Step 8: Build response ──────────────────────────────────────────────
        BookingDetails details = BookingDetails.builder()
                .bookingRef(bookingId)
                .userId(request.getUserId())
                .flightId(request.getFlightId())
                .cabinClass(request.getCabinClass())
                .passengers(request.getPassengerList())
                .seats(request.getSelectedSeats())
                .meals(request.getMeals())
                .pricing(pricing)
                .status("Confirmed")
                .checkinStatus("Pending")
                .bookedAt(now)
                .build();

        return BookingResponse.builder()
                .success(true)
                .booking(details)
                .build();
    }

    // ───────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * Selects the correct base price from the schedule based on cabin class.
     *
     * @param schedule  the flight schedule row
     * @param cabinClass "Economy" or "Business"
     * @return applicable base price per passenger
     */
    private BigDecimal resolveBasePrice(FlightSchedule schedule, String cabinClass) {
        return switch (cabinClass.toLowerCase()) {
            case "business" -> schedule.getBasePriceBusiness();
            default         -> schedule.getBasePriceEconomy(); // Economy + First default
        };
    }

    /**
     * Full pricing calculation per the business rules:
     * <pre>
     *   baseAmount = basePrice × passengerCount
     *   seatExtra  = Σ seat.extra_price
     *   mealCost   = (veg × 200) + (nonVeg × 300)
     *   subtotal   = baseAmount + seatExtra + mealCost
     *   tax        = ROUND(subtotal × 0.12)
     *   total      = subtotal + tax
     * </pre>
     */
    private PricingDto computePricing(BigDecimal basePrice,
                                      List<Seat> seats,
                                      int passengerCount,
                                      MealsDto meals) {

        BigDecimal baseAmount = basePrice.multiply(BigDecimal.valueOf(passengerCount));

        BigDecimal seatExtra = seats.stream()
                .map(Seat::getExtraPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal mealCost = VEG_MEAL_PRICE.multiply(BigDecimal.valueOf(meals.getVeg()))
                .add(NON_VEG_MEAL_PRICE.multiply(BigDecimal.valueOf(meals.getNonVeg())));

        BigDecimal subtotal = baseAmount.add(seatExtra).add(mealCost);

        BigDecimal tax      = subtotal.multiply(TAX_RATE)
                .setScale(0, RoundingMode.HALF_UP);

        BigDecimal total    = subtotal.add(tax);

        log.info("Pricing → baseAmount={} seatExtra={} mealCost={} subtotal={} tax={} total={}",
                baseAmount, seatExtra, mealCost, subtotal, tax, total);

        return PricingDto.builder()
                .baseAmount(baseAmount.longValue())
                .seatExtra(seatExtra.longValue())
                .tax(tax.longValue())
                .totalAmount(total.longValue())
                .build();
    }

    /**
     * Generates the next booking ID by reading the current max and incrementing.
     * Format: "B" + zero-padded 3-digit number (e.g. "B001", "B002", …).
     * Thread-safe within the transaction; DB uniqueness is enforced by the PK constraint.
     */
    private String generateNextBookingId() {
        return bookingRepository.findMaxBookingId()
                .map(maxId -> {
                    // maxId is like "B003" → extract "003" → parse 3 → next = 4
                    int current = Integer.parseInt(maxId.substring(1));
                    return String.format("B%03d", current + 1);
                })
                .orElse("B001"); // first booking ever
    }
}
