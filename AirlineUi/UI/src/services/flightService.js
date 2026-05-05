// flightService.js
import fallbackFlights, { AIRLINES } from '../data/flights.js';

// ✅ BW REST Endpoint (CONFIRMED WORKING IN POSTMAN)
// POST http://Umesh:8081/search
// POST http://Umesh:8081/getflight
// Routed via Vite proxy: /search-api → http://Umesh:8081
const SEARCH_API_BASE = '/search-api';

const FETCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

// Simple logger
function log(level, msg, meta = {}) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level](`[FlightService] ${ts} | ${msg}`, meta);
}

// Fetch helper with timeout
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

// Validation logic
function validateSearchInputs(from, to, date) {
  if (!from || !from.trim()) return 'Source city is required.';
  if (!to || !to.trim()) return 'Destination city is required.';
  if (!date || !date.trim()) return 'Travel date is required.';
  
  if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
    return 'Source and destination cannot be the same.';
  }
  
  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) {
    return 'Invalid travel date provided.';
  }
  
  return null;
}

// Mapping logic
function enrich(flight) {
  const airlineCode = flight.airline_code || flight.airlineCode || 'SV';
  const airline = AIRLINES[airlineCode] || { name: airlineCode, color: '#888' };
  
  const duration = flight.duration_minutes || flight.durationMin || 0;
  const h = Math.floor(duration / 60);
  const m = duration % 60;
  
  let dep = flight.departure_time || flight.departureTime || '08:00';
  if (dep.includes('T')) dep = dep.split('T')[1].slice(0, 5);
  else if (dep.match(/^\d{4}-\d{2}-\d{2}/)) dep = '08:00';
  
  let arr = flight.arrival_time || flight.arrivalTime || '10:00';
  if (arr.includes('T')) arr = arr.split('T')[1].slice(0, 5);
  else if (arr.match(/^\d{4}-\d{2}-\d{2}/)) arr = '10:00';
  
  const priceOpts = flight.price || {
    economy: flight.base_price_economy || 4000,
    business: flight.base_price_business || 12000,
    first: (flight.base_price_business || 12000) * 1.5
  };
  
  return {
    id: flight.flight_id || flight.id,
    airlineCode,
    flightNo: flight.flightNo || `${airlineCode} ${flight.flight_id || '101'}`,
    from: flight.source || flight.from,
    fromCode: (flight.source || flight.from || '---').slice(0, 3).toUpperCase(),
    to: flight.destination || flight.to,
    toCode: (flight.destination || flight.to || '---').slice(0, 3).toUpperCase(),
    departureTime: dep,
    arrivalTime: arr,
    durationMin: duration,
    durationLabel: m > 0 ? `${h}h ${m}m` : `${h}h`,
    price: priceOpts,
    stops: flight.stops || 0,
    seatsLeft: flight.available_seats ?? flight.seatsLeft ?? 50,
    rating: flight.rating || 4.5,
    amenities: flight.amenities || ['WiFi', 'Meal'],
    airline
  };
}

/**
 * Search flights
 */
export async function searchFlights({
  from = '',
  to = '',
  date,
  passengers = 1,
  tripClass = 'economy',
  tripType = 'one-way'
} = {}) {
  const vError = validateSearchInputs(from, to, date);
  if (vError) throw new Error(vError);

  const payload = {
    source: from.trim(),
    destination: to.trim(),
    travel_date: date
  };

  log('info', `Searching flights via API`, payload);

  let data = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const res = await fetchWithTimeout(`${SEARCH_API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      data = await res.json();
      break;
    } catch (err) {
      if (attempt <= MAX_RETRIES && (err.name === 'AbortError' || err.name === 'TypeError')) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      throw new Error('Unable to reach flight search service. Please try again.');
    }
  }

  if (data && data.success === false) {
    throw new Error(data.message || 'Flights not found.');
  }

  let rawFlights = (data && data.success && data.flights) ? data.flights : [];
  rawFlights = rawFlights.filter(f => (f.available_seats > 0 || f.seatsLeft > 0));

  let results = rawFlights.map(f => {
    const enriched = enrich(f);
    const baseOpt = enriched.price[tripClass] || enriched.price.economy;
    
    return {
      ...enriched,
      displayPrice: baseOpt * passengers,
      selectedClass: tripClass,
      passengers,
      tripType,
      searchDate: date
    };
  });

  results.sort((a, b) => {
    if (a.stops !== b.stops) return a.stops - b.stops;
    return a.displayPrice - b.displayPrice;
  });

  return results;
}

/**
 * Get flight by ID
 */
export async function getFlightById(id) {
  if (!id || !id.trim()) throw new Error('Flight ID is required.');

  const payload = { flight_id: id.trim() };
  log('info', `Fetching flight by ID`, payload);

  const res = await fetchWithTimeout(`${SEARCH_API_BASE}/getflight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (data && data.success === true && Array.isArray(data.flight) && data.flight.length > 0) {
    return enrich(data.flight[0]);
  }

  throw new Error('Flight Not Found');
}