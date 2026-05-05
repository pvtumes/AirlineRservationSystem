/**
 * bookings.js — In-memory bookings store (resets on page refresh, as expected for mock data).
 *
 * Structure of a booking record:
 * {
 *   bookingRef  : string,          // e.g. "SV-A3F9K2"
 *   flightId    : string,
 *   flightNo    : string,
 *   passengers  : PassengerDetails[],
 *   seats       : string[],        // seat IDs e.g. ["12A", "12B"]
 *   meals       : { veg: number, nonVeg: number },
 *   class       : 'economy'|'business',
 *   totalPrice  : number,
 *   status      : 'confirmed',
 *   bookedAt    : string (ISO),
 * }
 */

const _store = [];          // in-memory array
const _booked = new Map();  // flightId → Set of booked seat IDs

/**
 * Remove seats from the booked set (on cancellation).
 */
export function freeSeats(flightId, seatIds) {
  const set = _booked.get(flightId);
  if (set) seatIds.forEach(id => set.delete(id));
}

/**
 * Cancel a booking by ref — updates status and frees seats.
 * Returns the updated booking or null if not found.
 */
export function cancelBookingRecord(bookingRef) {
  const idx = _store.findIndex(b => b.bookingRef === bookingRef);
  if (idx === -1) return null;
  _store[idx] = { ..._store[idx], status: 'cancelled', cancelledAt: new Date().toISOString() };
  freeSeats(_store[idx].flightId, _store[idx].seats ?? []);
  return _store[idx];
}

/**
 * Add a seat to the booked set for a given flight.
 * Called by bookingService when a booking is confirmed.
 */
export function markSeatsBooked(flightId, seatIds) {
  if (!_booked.has(flightId)) _booked.set(flightId, new Set());
  seatIds.forEach(id => _booked.get(flightId).add(id));
}

/**
 * Return the set of dynamically-booked seat IDs for a flight
 * (on top of the static pre-booked ones in seats.js).
 */
export function getDynamicBookedSeats(flightId) {
  return _booked.get(flightId) ?? new Set();
}

/**
 * Persist a completed booking record.
 */
export function addBooking(record) {
  _store.push(record);
}

/**
 * Retrieve all bookings (could be filtered by user in a real app).
 */
export function getAllBookings() {
  return [..._store];
}

/**
 * Retrieve bookings for a specific flight.
 */
export function getBookingsByFlight(flightId) {
  return _store.filter(b => b.flightId === flightId);
}

/**
 * Find a single booking by PNR/ref (case-insensitive).
 * Returns null if not found.
 */
export function findBookingByRef(ref) {
  const norm = ref.trim().toUpperCase();
  return _store.find(b => b.bookingRef.toUpperCase() === norm) ?? null;
}

/**
 * Mark a booking as checked-in.
 * Adds checkin metadata and optional seat override.
 * Returns updated record or null.
 */
export function checkInBooking(bookingRef, { seat = null, gate, boardingTime, terminal } = {}) {
  const idx = _store.findIndex(b => b.bookingRef.toUpperCase() === bookingRef.trim().toUpperCase());
  if (idx === -1) return null;
  _store[idx] = {
    ..._store[idx],
    checkinStatus: 'checked-in',
    checkedInAt:   new Date().toISOString(),
    boardingPass: {
      gate,
      boardingTime,
      terminal,
      seat: seat ?? _store[idx].seats?.[0] ?? 'N/A',
    },
  };
  return _store[idx];
}
