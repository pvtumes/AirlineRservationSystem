/**
 * checkinService.js
 *
 * Integrates two real REST APIs for the SkyVoyage web check-in flow:
 *
 *   Step 1  POST /checkin-api/webcheckinapi       → look up booking by PNR
 *   Step 2  POST /checkin-api/updatecheckinstatus → record checked-in status
 *
 * Requests are sent via the Vite dev-proxy (/checkin-api → http://Umesh:8082)
 * so the browser never makes cross-origin calls.
 *
 * Helper utilities (gate, boarding time, eligibility, boarding pass shape)
 * are preserved so CheckinPage.jsx works without changes.
 */

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

const CHECKIN_API_BASE = '/checkin-api';   // proxied →http://Umesh:8082
const FETCH_TIMEOUT_MS = 10_000;           // 10 s per request
const MAX_RETRIES = 2;                // retry transient network failures
const CACHE_TTL_MS = 60_000;          // 60 s booking cache

/* ─────────────────────────────────────────────────────────────────────────────
   SIMPLE IN-MEMORY CACHE  (keyed by PNR, evicted after CACHE_TTL_MS)
───────────────────────────────────────────────────────────────────────────── */

const _cache = new Map(); // pnr → { data, expiresAt }

function cacheGet(pnr) {
  const entry = _cache.get(pnr.trim().toUpperCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(pnr.trim().toUpperCase()); return null; }
  return entry.data;
}

function cacheSet(pnr, data) {
  _cache.set(pnr.trim().toUpperCase(), { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOGGER  (omits PNR from log output)
───────────────────────────────────────────────────────────────────────────── */

function log(level, msg, meta = {}) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level](`[CheckinService] ${ts} | ${msg}`, meta);
}

/* ─────────────────────────────────────────────────────────────────────────────
   PNR VALIDATION
   Accepts any non-empty string (server-side is authoritative).
   Rejects blank / whitespace-only values early to save a round-trip.
───────────────────────────────────────────────────────────────────────────── */

export function validatePnr(pnr) {
  if (!pnr || !pnr.trim()) {
    return { valid: false, error: 'Please enter your PNR / Booking Reference.' };
  }
  if (pnr.trim().length < 2) {
    return { valid: false, error: 'PNR must be at least 2 characters.' };
  }
  return { valid: true, error: null };
}

/* ─────────────────────────────────────────────────────────────────────────────
   HTTP HELPER  (fetch + timeout + retry)
───────────────────────────────────────────────────────────────────────────── */

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

async function postJson(endpoint, body, retries = MAX_RETRIES) {
  const url = `${CHECKIN_API_BASE}${endpoint}`;
  log('info', `→ POST ${endpoint}`, { bodyKeys: Object.keys(body) });

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        // JSON parse error — server returned invalid JSON
        log('error', `Invalid JSON response: ${res.status}`, { endpoint });
        throw new Error('Server returned an invalid response. Please try again.');
      }

      // Check HTTP status
      if (!res.ok) {
        const errorMsg = data?.Error || data?.Message || `HTTP ${res.status}: ${res.statusText}`;
        log('warn', `← ${res.status} ${endpoint}`, { error: errorMsg });
        
        // Don't retry on 4xx errors (client errors)
        if (res.status >= 400 && res.status < 500) {
          throw new Error(data?.Error || data?.Message || `Request failed: ${res.statusText}`);
        }
        // 5xx errors are retriable
        throw new Error(errorMsg);
      }

      log('info', `← ${res.status} ${endpoint}`, { success: data?.Success });
      return data;

    } catch (err) {
      const isNetworkErr = err.name === 'AbortError' || err.name === 'TypeError';
      const isLast = attempt === retries + 1;

      if (isNetworkErr && !isLast) {
        log('warn', `Network error on attempt ${attempt}/${retries + 1} — retrying…`, { endpoint });
        await new Promise(r => setTimeout(r, 500 * attempt)); // back-off
        continue;
      }

      // Final attempt / non-network error
      log('error', `Request failed: ${endpoint}`, { error: err.message, attempt });

      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      if (err.name === 'TypeError') {
        throw new Error('Could not reach the server. Please check your network connection.');
      }
      throw err;
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 1 — LOOKUP BOOKING  (POST /webcheckinapi)
   Called by CheckinPage when the user submits their PNR.
───────────────────────────────────────────────────────────────────────────── */

/**
 * Look up a booking by PNR using the real Web Check-in API.
 *
 * API response shape (success):
 *   { Success: true, Booking: { BookingRef, FlightId, CabinClass,
 *       Passengers: { Passenger: [ {Name}, … ] }, Status, CheckinStatus },
 *     Flight: { Id, From, To, DepartureTime, ArrivalTime } }
 *
 * Returns a normalised { booking, flight } object that CheckinPage.jsx
 * already understands (same keys as the previous mock service).
 *
 * @param {string} pnr
 * @returns {Promise<{ booking: object, flight: object }>}
 * @throws Error with user-facing message
 */
export async function lookupBooking(pnr) {
  // ── Validate ──
  const { valid, error: validErr } = validatePnr(pnr);
  if (!valid) throw new Error(validErr);

  // ── Cache check ──
  const cached = cacheGet(pnr);
  if (cached) {
    log('info', 'Cache hit for PNR (masked)', { cached: true });
    return cached;
  }

  // ── API call ──
  const data = await postJson('/webcheckinapi', { Pnr: pnr.trim() });

  if (!data.Success) {
    // Log failure without exposing PNR
    log('warn', 'Booking lookup failed', { reason: data.Error });
    throw new Error(data.Error ?? 'Booking not found. Please check your PNR and try again.');
  }

  // ── Normalise API response to internal shape ──
  const raw = data.Booking;
  const rawFl = data.Flight;

  // ── Passengers: API sends { Passenger: [{Name}…] } — normalise to [{name}…]
  //    IMPORTANT: Ensure we always have at least one passenger for valid booking
  let passengerList = (raw.Passengers?.Passenger ?? []).map(p => ({ name: p.Name }));
  
  // Guard: empty passenger list is invalid
  if (!passengerList || passengerList.length === 0) {
    log('error', 'Booking has no passengers', { pnr: 'MASKED' });
    throw new Error('No passengers found for this booking. Please contact support.');
  }

  // Sanitize passenger names (trim, remove empty strings)
  passengerList = passengerList.filter(p => p.name && p.name.trim()).map(p => ({
    name: p.name.trim().toUpperCase(),
  }));

  if (passengerList.length === 0) {
    throw new Error('No valid passengers found for this booking.');
  }

  // Parse time strings from ISO datetime  e.g. "1970-01-01T08:00:00+05:30" → "08:00"
  const toHHMM = (isoOrTime) => {
    if (!isoOrTime) return '—';
    // If it looks like a full ISO datetime, extract the time part
    // Match patterns like "T08:00:00" or "T08:00"
    const m = isoOrTime.match(/T(\d{2}:\d{2})/);
    if (m) return m[1];
    // If it's "08:00:00", extract first 5 chars
    if (/^\d{2}:\d{2}/.test(isoOrTime)) return isoOrTime.slice(0, 5);
    // else '—'
    return '—';
  };

  const depTime = toHHMM(rawFl?.DepartureTime);
  const arrTime = toHHMM(rawFl?.ArrivalTime);

  const booking = {
    bookingRef: raw.BookingRef,
    flightId: raw.FlightId,
    flightNo: raw.FlightId,          // API doesn't expose a display flightNo; use ID
    cabinClass: raw.CabinClass ?? 'Economy',
    passengers: passengerList,        // ✅ Now guaranteed to have at least 1 passenger
    seats: [],                        // API doesn't expose seat numbers in lookup
    status: (raw.Status ?? '').toLowerCase().trim() || 'confirmed',
    checkinStatus: (raw.CheckinStatus ?? '').toLowerCase().trim().replace(/\s+/g, '-') || 'not-checked-in',
    // Timestamp of check-in (if already checked in)
    checkedInAt: raw.CheckedInAt || null,
  };

  const flight = {
    id: rawFl?.Id || raw.FlightId,
    from: rawFl?.From || '—',
    fromCode: (rawFl?.From || '—').slice(0, 3).toUpperCase(),
    to: rawFl?.To || '—',
    toCode: (rawFl?.To || '—').slice(0, 3).toUpperCase(),
    departureTime: depTime,
    arrivalTime: arrTime,
    durationLabel: calcDuration(depTime, arrTime),
    stops: 0,
    airline: { name: 'SkyVoyage', code: 'SV', color: '#1956D6' },
  };

  const result = { booking, flight };

  // ── Cache ──
  cacheSet(pnr, result);

  return result;
}

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 2 — PERFORM CHECK-IN  (POST /updatecheckinstatus)
   Called by CheckinPage when the user clicks "Confirm Web Check-in".
───────────────────────────────────────────────────────────────────────────── */

/**
 * Mark the booking as checked-in via the real Update Check-in Status API.
 *
 * API response shape (success):
 *   { Success: true, Message, Pnr, CheckinStatus, CheckedInAt }
 *
 * Returns a boarding pass data-object ready for the UI.
 *
 * @param {string} bookingRef   PNR / booking reference used in the lookup step
 * @param {object} context      { booking, flight } from the lookup result
 * @param {object} [options]
 * @param {string|null} [options.seat]   optional seat override
 * @returns {Promise<{ booking: object, boardingPass: object }>}
 * @throws Error with user-facing message
 */
export async function performCheckin(bookingRef, context = {}, { seat = null } = {}) {
  const { booking: existingBooking, flight } = context;

  // ── Validation: PNR must be provided ──
  if (!bookingRef || !bookingRef.trim()) {
    throw new Error('Booking reference is required.');
  }

  // Guard: do not re-submit for already checked-in bookings
  if (existingBooking?.checkinStatus === 'checked-in' || existingBooking?.checkinStatus === 'checkedin') {
    log('info', 'Booking already checked in; returning cached boarding pass', { pnr: 'MASKED' });
    const bp = generateBoardingPass(
      {
        ...existingBooking, 
        checkedInAt: existingBooking.checkedInAt ?? new Date().toISOString(),
        boardingPass: buildBoardingPassMeta(existingBooking.flightId, seat)
      },
      flight
    );
    return { booking: existingBooking, boardingPass: bp };
  }

  // ── API call ──
  let data;
  try {
    data = await postJson('/updatecheckinstatus', { Pnr: bookingRef.trim() });
  } catch (err) {
    // Network/timeout errors already have user-friendly messages from postJson
    throw err;
  }

  if (!data.Success) {
    const errorMsg = data.Error ?? data.Message ?? 'Check-in failed. Please try again.';
    // Check if it's a duplicate check-in error
    if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('duplicate')) {
      log('warn', 'Duplicate check-in attempt detected', { pnr: 'MASKED' });
    }
    log('error', 'Check-in update failed', { error: errorMsg });
    throw new Error(errorMsg);
  }

  log('info', 'Check-in confirmed', { checkedInAt: data.CheckedInAt });

  // Invalidate cache so next lookup gets fresh data
  _cache.delete(bookingRef.trim().toUpperCase());

  // Build enriched booking object
  const updatedBooking = {
    ...(existingBooking ?? {}),
    bookingRef: data.Pnr ?? bookingRef,
    checkinStatus: (data.CheckinStatus ?? 'checked-in').toLowerCase().trim().replace(/\s+/g, '-'),
    checkedInAt: data.CheckedInAt ?? new Date().toISOString(),
    boardingPass: buildBoardingPassMeta(existingBooking?.flightId ?? bookingRef, seat),
  };

  const boardingPass = generateBoardingPass(updatedBooking, flight);
  return { booking: updatedBooking, boardingPass };
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

/** Deterministic gate / terminal from flight ID — keeps UI consistent */
function seedRand(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getGateInfo(flightId) {
  const n = seedRand(flightId || 'XX');
  const gateNum = (n % 24) + 1;
  const gateLetter = ['A', 'B', 'C', 'D', 'E'][n % 5];
  const terminal = `T${(n % 3) + 1}`;
  return { gate: `${gateLetter}${gateNum}`, terminal };
}

/** Boarding time = departure − 45 min */
function calcBoardingTime(departureTime) {
  if (!departureTime || departureTime === '—') return '—';
  const [h, m] = departureTime.split(':').map(Number);
  const total = h * 60 + m - 45;
  const bh = Math.floor((total + 1440) % 1440 / 60);
  const bm = (total + 1440) % 60;
  return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
}

/** Duration label from two "HH:MM" strings */
function calcDuration(dep, arr) {
  try {
    const [dh, dm] = dep.split(':').map(Number);
    const [ah, am] = arr.split(':').map(Number);
    let mins = (ah * 60 + am) - (dh * 60 + dm);
    if (mins < 0) mins += 1440; // next-day arrival
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  } catch {
    return '—';
  }
}

/** Generate gate/terminal/boardingTime meta used by the boarding pass */
function buildBoardingPassMeta(flightId, seatOverride = null) {
  const { gate, terminal } = getGateInfo(flightId ?? 'XX');
  return { gate, terminal, boardingTime: '—', seat: seatOverride ?? '—' };
}

/** Check-in eligibility with robust status checking */
export function getCheckinEligibility(booking) {
  if (!booking) {
    return { canCheckin: false, reason: 'No booking information available.' };
  }

  const status = (booking.status ?? '').toLowerCase().trim().replace(/\s+/g, '-');
  const checkinStatus = (booking.checkinStatus ?? '').toLowerCase().trim().replace(/\s+/g, '-');

  // Check for cancelled status
  if (status === 'cancelled' || status.includes('cancel')) {
    return { canCheckin: false, reason: 'This booking has been cancelled.' };
  }

  // Check for already checked-in status
  if (checkinStatus === 'checked-in' || checkinStatus === 'checkedin' || checkinStatus.includes('checked')) {
    return { canCheckin: false, reason: 'Already checked in.', alreadyDone: true };
  }

  // Check for valid status
  if (status !== 'confirmed' && status !== 'booked') {
    return { canCheckin: false, reason: `Booking status: ${status}. Check-in unavailable.` };
  }

  return { canCheckin: true, reason: 'Eligible for check-in.' };
}

/**
 * Build a boarding pass data-object from a checked-in booking + flight.
 * Pure function — no side effects.
 */
export function generateBoardingPass(booking, flight) {
  const { gate, terminal, boardingTime, seat } = booking.boardingPass ?? {};
  const passenger = booking.passengers?.[0] ?? {};

  return {
    passengerName: passenger.name || 'Passenger',
    bookingRef: booking.bookingRef,
    flightNo: booking.flightNo ?? booking.flightId ?? '—',
    flightId: booking.flightId,
    cabinClass: booking.cabinClass ?? 'Economy',
    seat: seat ?? booking.seats?.[0] ?? '—',
    from: flight?.from || '—',
    fromCode: flight?.fromCode || '—',
    to: flight?.to || '—',
    toCode: flight?.toCode || '—',
    departureTime: flight?.departureTime || '—',
    arrivalTime: flight?.arrivalTime || '—',
    boardingTime: boardingTime || calcBoardingTime(flight?.departureTime) || '—',
    gate: gate || getGateInfo(booking.flightId ?? 'XX').gate,
    terminal: terminal || getGateInfo(booking.flightId ?? 'XX').terminal,
    checkedInAt: booking.checkedInAt,
    airlineColor: flight?.airline?.color ?? '#1956D6',
    airlineCode: (booking.flightId ?? 'SV').slice(0, 2),
    durationLabel: flight?.durationLabel || '—',
    stops: flight?.stops ?? 0,
  };
}
