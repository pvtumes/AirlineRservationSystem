/**
 * bookingService.js
 *
 * Handles all booking logic:
 *   - Seat availability check via API
 *   - Booking creation
 *   - Seat status update
 *   - Booking reference generation
 *
 * ✅ LOGIC UNCHANGED
 * ✅ ONLY REQUIRED FIX APPLIED (payload cleaning + response check)
 */

import { markSeatsBooked, getDynamicBookedSeats, addBooking } from '../data/bookings.js';
import { getFlightById } from './flightService.js';

const SEATS_API_BASE = '/seats-api';     // proxied → http://Umesh:8083
const BOOKING_API_BASE = '/booking-api'; // proxied → http://Umesh:8086

const FETCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

const seatCache = new Map();

function log(level, msg, meta = {}) {
  const ts = new Date().toISOString();
  console[level](`[BookingService] ${ts} | ${msg}`, meta);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timerId);
  }
}

/* ── Reference generator ────────────────────────────────── */
function generateRef(prefix = 'SV') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${ref}`;
}

/* ── Fetch Seat Map API ─────────────────────────────────── */
export async function fetchSeatMapAPI(flightId) {
  if (!flightId) throw new Error('flightId is required');

  if (seatCache.has(flightId)) {
    return seatCache.get(flightId);
  }

  log('info', `Fetching seats for flight`, { flightId });
  const payload = { flight_id: flightId };
  let data = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const res = await fetchWithTimeout(`${SEATS_API_BASE}/seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await res.json();
      break;
    } catch (err) {
      if (attempt <= MAX_RETRIES && (err.name === 'AbortError' || err.name === 'TypeError')) {
        log('warn', `API fetch failed, retrying (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      log('error', `API entirely failed`, { name: err.name, msg: err.message });
      throw new Error("Unable to load seats. Please try again.");
    }
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid seat data received from server.');
  }

  // ── Deduplicate (prefer Booked status) ──────────────────
  const dedupedMap = new Map();
  for (const s of data) {
    const existing = dedupedMap.get(s.seat_number);
    if (!existing || s.seat_status === 'Booked') {
      dedupedMap.set(s.seat_number, s);
    }
  }

  const processedSeats = Array.from(dedupedMap.values());

  // ── Separate by class ───────────────────────────────────
  const businessRaw = processedSeats.filter(s => {
    const cls = s.seat_class.toLowerCase();
    return cls === 'business' || cls === 'first';
  });
  const economyRaw = processedSeats.filter(s => {
    const cls = s.seat_class.toLowerCase();
    return cls === 'economy';
  });

  /* ── BUSINESS: seats already use standard notation e.g. "1C", "2A"
        → extract row number + column letter directly               */
  const bMap = new Map();
  for (const s of businessRaw) {
    // Accept both "1C" (digit+letter) and "C1" (letter+digit) just in case
    const m = s.seat_number.match(/^(\d+)([A-Za-z]+)$/) ||
              s.seat_number.match(/^([A-Za-z]+)(\d+)$/);
    if (!m) continue;

    const rowNum = parseInt(m[1], 10) || parseInt(m[2], 10);
    const label  = isNaN(parseInt(m[1], 10)) ? m[1].toUpperCase() : m[2].toUpperCase();

    const uiSeat = {
      id: s.seat_number, seat_id: s.seat_id,
      label, class: s.seat_class.toLowerCase(),
      status: s.seat_status.toLowerCase(), extraPrice: s.extra_price
    };
    if (!bMap.has(rowNum)) bMap.set(rowNum, []);
    bMap.get(rowNum).push(uiSeat);
  }

  /* ── ECONOMY: seats are a flat sequential list "S4", "S5" … "S100"
        → sort by their numeric suffix
        → group into rows of SEATS_PER_ROW (6 → 3 left + 3 right)
        → assign column labels A B C / D E F by position in the row */
  const ECON_COLS   = ['A', 'B', 'C', 'D', 'E', 'F'];   // standard 3-3 layout
  const SEATS_PER_ROW = ECON_COLS.length;                 // 6

  // Sort economy seats by their number
  economyRaw.sort((a, b) => {
    const numA = parseInt(a.seat_number.replace(/\D/g, ''), 10);
    const numB = parseInt(b.seat_number.replace(/\D/g, ''), 10);
    return numA - numB;
  });

  const eRows = [];
  for (let i = 0; i < economyRaw.length; i += SEATS_PER_ROW) {
    const chunk  = economyRaw.slice(i, i + SEATS_PER_ROW);
    const rowNum = Math.floor(i / SEATS_PER_ROW) + 1;   // Row 1, 2, 3 …
    const seats  = chunk.map((s, colIdx) => ({
      id:         s.seat_number,
      seat_id:    s.seat_id,
      label:      ECON_COLS[colIdx],                     // A / B / C / D / E / F
      class:      s.seat_class.toLowerCase(),
      status:     s.seat_status.toLowerCase(),
      extraPrice: s.extra_price,
    }));
    eRows.push({ row: rowNum, seats });
  }

  // ── Build business rows ──────────────────────────────────
  const buildBusRows = (rowMap) =>
    Array.from(rowMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([row, seats]) => ({ row, seats: seats.sort((a, b) => a.label.localeCompare(b.label)) }));

  const seatMap = { business: [], economy: [] };
  seatMap.business = buildBusRows(bMap);
  seatMap.economy  = eRows;

  seatCache.set(flightId, seatMap);
  return seatMap;
}

/* ── Seat extra price lookup ────────────────────────────── */
export function getSeatExtraPrice(flightId, seatId) {
  if (!seatCache.has(flightId)) return 0;
  const map = seatCache.get(flightId);
  const flatSeats = [...map.business, ...map.economy].flatMap(r => r.seats);
  const seat = flatSeats.find(s => s.id === seatId);
  return seat ? seat.extraPrice : 0;
}

/* ── Create booking ─────────────────────────────────────── */
export async function createBooking({
  flightId,
  flightNo,
  cabinClass = 'economy',
  passengerList = [],
  selectedSeats = [],
  meals = { veg: 0, nonVeg: 0 },
  basePrice = 0,
  userId = 'U103',
}) {
  await new Promise(r => setTimeout(r, 800));

  // ── 1. Local seat validation ──────────────────────────────
  const seatMap = await fetchSeatMapAPI(flightId);
  const allSeats = [...seatMap.business, ...seatMap.economy].flatMap(r => r.seats);
  for (const seatId of selectedSeats) {
    const seat = allSeats.find(s => s.id === seatId);
    if (!seat || seat.status === 'booked') {
      throw new Error(`Seat ${seatId} is no longer available.`);
    }
  }

  // ── 2. Local price fallback values ────────────────────────
  const seatExtra = selectedSeats.reduce((sum, id) => sum + getSeatExtraPrice(flightId, id), 0);
  const mealCost = (meals.veg * 250) + (meals.nonVeg * 350);
  const baseFareTotal = basePrice * passengerList.length;
  const subtotal = baseFareTotal + seatExtra + mealCost;
  const tax = Math.round(subtotal * 0.12);

  // ── 3. Flight meta (for local record) ────────────────────
  let flightFrom = '', flightTo = '', flightDeparture = '';
  try {
    const f = await getFlightById(flightId);
    if (f) { flightFrom = f.from; flightTo = f.to; flightDeparture = f.departureTime; }
  } catch { /* non-critical */ }

  // ── 4. Call new Booking API (POST /api/bookings) ─────────
  const cabinClassAPI = cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1);

  // Build passenger payload: API needs name, age, gender
  const apiPassengers = passengerList.map(p => ({
    name: p.name,
    age: p.age
      ? Number(p.age)
      : p.dob
        ? Math.floor((Date.now() - new Date(p.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 25,
    gender: p.gender || 'Male',
  }));

  let apiBookingRef = null;
  let apiPricing = null;

  try {
    const res = await fetchWithTimeout('/new-booking-api/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        flightId,
        cabinClass: cabinClassAPI,
        selectedSeats,
        passengerList: apiPassengers,
        meals,
      }),
    });

    if (!res.ok) {
      // Parse the server error message
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error || `Booking failed (HTTP ${res.status})`;

      // 4xx business errors → surface to user (do NOT fall back)
      if (res.status === 409 || res.status === 400 || res.status === 404) {
        const e = new Error(msg);
        e.isApiError = true;
        throw e;
      }

      log('warn', `Booking API returned ${res.status}, using local fallback`);
    } else {
      const data = await res.json();
      if (data.success && data.booking) {
        apiBookingRef = data.booking.bookingRef;
        apiPricing = data.booking.pricing;
        log('info', '✅ Booking API success', { ref: apiBookingRef });
      }
    }
  } catch (err) {
    if (err.isApiError) throw err;   // re-throw 4xx to UI
    log('warn', 'Booking API unreachable — local fallback active', { msg: err.message });
  }

  // ── 5. Build final booking object ────────────────────────
  const booking = {
    bookingRef: apiBookingRef ?? generateRef(),
    flightId,
    flightNo,
    cabinClass,
    passengers: passengerList,
    seats: selectedSeats,
    meals,
    seatExtra: apiPricing?.seatExtra ?? seatExtra,
    mealCost,
    basePrice: apiPricing?.baseAmount ?? baseFareTotal,
    subtotal,
    tax: apiPricing?.tax ?? tax,
    totalPrice: apiPricing?.totalAmount ?? (subtotal + tax),
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    flightFrom,
    flightTo,
    flightDeparture,
  };

  // ── 6. Persist to local state ─────────────────────────────
  markSeatsBooked(flightId, selectedSeats);
  addBooking(booking);

  return booking;
}

/* ── Booking Details API (port 8091) ────────────────────── */

/** Returns null for missing/invalid/1970-epoch timestamps */
function normaliseTs(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return null;
  return d.toISOString();
}

/** Maps raw API booking object → UI shape */
function normaliseApiBooking(raw) {
  return {
    bookingRef:    raw.booking_id    ?? '—',
    flightId:      raw.flight_id     ?? '—',
    userId:        raw.user_id       ?? '',
    flightFrom:    raw.source        ?? '',
    flightTo:      raw.destination   ?? '',
    routeType:     raw.route_type    ?? '',
    travelDate:    raw.travel_date   ? raw.travel_date.split('+')[0] : null,
    departureTime: normaliseTs(raw.departure_time),
    arrivalTime:   normaliseTs(raw.arrival_time),
    bookedAt:      normaliseTs(raw.booking_time),
    cabinClass:    raw.cabin_class   ?? 'Economy',
    status:        (raw.status ?? 'confirmed').toLowerCase(),
    checkinStatus: raw.checkin_status ?? 'Pending',
    paymentStatus: raw.payment_status || 'Pending',
    meals: {
      veg:    raw.veg_count    ?? 0,
      nonVeg: raw.nonveg_count ?? 0,
    },
    totalPrice: raw.total_amount ?? 0,
    tax:        raw.tax_amount   ?? 0,
    _source: 'api',
  };
}

/**
 * Fetch all bookings for a user from the Booking Details API.
 * Returns normalised booking objects, or [] on no-data.
 * Throws a user-friendly Error on network / server failures.
 */
export async function fetchUserBookings(userId) {
  if (!userId) return [];

  log('info', 'Fetching bookings from API', { userId });

  let res;
  try {
    res = await fetchWithTimeout(
      `/booking-details-api/booking/${encodeURIComponent(userId)}`
    );
  } catch (err) {
    log('error', 'Booking details API unreachable', { msg: err.message });
    throw new Error('Could not reach the bookings server. Showing local bookings only.');
  }

  if (!res.ok) {
    log('warn', `Booking details API returned ${res.status}`);
    if (res.status === 404) return [];
    throw new Error(`Bookings server error (${res.status}). Showing local bookings only.`);
  }

  let json;
  try {
    json = await res.json();
  } catch {
    log('warn', 'Booking details API returned non-JSON body');
    return [];
  }

  const items = Array.isArray(json?.item) ? json.item : [];
  log('info', `Received ${items.length} bookings from API`, { userId });
  return items.map(normaliseApiBooking);
}