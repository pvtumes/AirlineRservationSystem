/**
 * seats.js — Mock seat map generator
 *
 * Each flight gets a seat layout:
 *   Business  : rows 1–6,  seats A B _ C D  (4 seats, aisle gap at index 2)
 *   Economy   : rows 7–30, seats A B C _ D E F (6 seats, aisle gap at index 3)
 *
 * Per-flight pre-booked seats are seeded deterministically from the flight ID
 * so the map is consistent across renders.
 */

const BUSINESS_ROWS  = 6;
const ECONOMY_ROWS   = 24;
const BUSINESS_SEATS = ['A', 'B', 'C', 'D'];
const ECONOMY_SEATS  = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Simple deterministic hash so the same flight always has the same booked seats */
function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pseudo(n, max) {
  // LCG-style cheap random in [0, max)
  return ((n * 1664525 + 1013904223) >>> 0) % max;
}

/**
 * Generate the full seat map for a flight.
 *
 * Returns an object: { business: [...rows], economy: [...rows] }
 * Each row = { row: number, seats: [{ id, label, class, status }] }
 */
export function generateSeatMap(flightId) {
  const base = seed(flightId || 'DEFAULT');

  // Collect all seat ids for pre-booking
  const allBusiness = [];
  const allEconomy  = [];

  for (let r = 1; r <= BUSINESS_ROWS; r++)
    for (const s of BUSINESS_SEATS) allBusiness.push(`${r}${s}`);

  for (let r = BUSINESS_ROWS + 1; r <= BUSINESS_ROWS + ECONOMY_ROWS; r++)
    for (const s of ECONOMY_SEATS) allEconomy.push(`${r}${s}`);

  // Pre-book ~30% of economy, ~20% of business
  const bookedEcon = new Set();
  const bookedBiz  = new Set();

  const econCount = Math.floor(allEconomy.length  * 0.30);
  const bizCount  = Math.floor(allBusiness.length * 0.20);

  let n = base;
  for (let i = 0; i < econCount; i++) {
    n = pseudo(n, allEconomy.length);
    bookedEcon.add(allEconomy[n]);
  }
  n = base + 7;
  for (let i = 0; i < bizCount; i++) {
    n = pseudo(n, allBusiness.length);
    bookedBiz.add(allBusiness[n]);
  }

  // Build business rows
  const businessRows = [];
  for (let r = 1; r <= BUSINESS_ROWS; r++) {
    businessRows.push({
      row: r,
      seats: BUSINESS_SEATS.map(s => ({
        id:     `${r}${s}`,
        label:  s,
        class:  'business',
        status: bookedBiz.has(`${r}${s}`) ? 'booked' : 'available',
      })),
    });
  }

  // Build economy rows
  const economyRows = [];
  for (let r = BUSINESS_ROWS + 1; r <= BUSINESS_ROWS + ECONOMY_ROWS; r++) {
    economyRows.push({
      row: r,
      seats: ECONOMY_SEATS.map(s => ({
        id:     `${r}${s}`,
        label:  s,
        class:  'economy',
        status: bookedEcon.has(`${r}${s}`) ? 'booked' : 'available',
      })),
    });
  }

  return { business: businessRows, economy: economyRows };
}

export const SEAT_PRICES = {
  business: { A: 2500, B: 2000, C: 2000, D: 2500 },   // window premium
  economy:  { A: 800,  B: 600,  C: 400,  D: 400, E: 600,  F: 800 },
};

export const SEAT_FEATURES = {
  A: 'Window',
  B: 'Middle',
  C: 'Aisle',
  D: 'Aisle',
  E: 'Middle',
  F: 'Window',
};
