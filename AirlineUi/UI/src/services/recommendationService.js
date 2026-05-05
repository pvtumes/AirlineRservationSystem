/**
 * recommendationService.js
 *
 * Scores every enriched flight and returns the top picks with
 * a human-readable reason label for each preference mode.
 *
 * Preference modes:
 *   'cheap'  — lowest price wins
 *   'fast'   — shortest duration wins
 *   'best'   — holistic score (rating + seats + stops + price)
 */

/* ── Score weights ──────────────────────────────────────── */
const WEIGHTS = {
  cheap: { price: 0.70, duration: 0.15, rating: 0.10, seats: 0.05 },
  fast:  { price: 0.10, duration: 0.65, rating: 0.15, seats: 0.10 },
  best:  { price: 0.25, duration: 0.20, rating: 0.35, seats: 0.20 },
};

/* ── Normalise a value into [0, 1] ─────────────────────── */
function normalise(value, min, max) {
  if (max === min) return 1;
  return (value - min) / (max - min);
}

/* ── Reason label map ──────────────────────────────────── */
const REASON_LABEL = {
  cheap: 'Best price',
  fast:  'Fastest flight',
  best:  'Top rated',
};

/**
 * Score and rank flights.
 *
 * @param {Array}  flights    - enriched flight objects from flightService
 * @param {string} preference - 'cheap' | 'fast' | 'best'
 * @param {number} topN       - how many recommendations to return (default 3)
 * @returns {Array} flights with { score, recommendationReason, isRecommended }
 */
export function recommendFlights(flights, preference = 'best', topN = 3) {
  if (!flights || flights.length === 0) return [];

  const pref = WEIGHTS[preference] || WEIGHTS.best;

  // ── Compute min/max for normalisation ──
  const prices    = flights.map(f => f.displayPrice);
  const durations = flights.map(f => f.durationMin);
  const ratings   = flights.map(f => f.rating);
  const seats     = flights.map(f => f.seatsLeft);

  const minPrice    = Math.min(...prices);
  const maxPrice    = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minRating   = Math.min(...ratings);
  const maxRating   = Math.max(...ratings);
  const minSeats    = Math.min(...seats);
  const maxSeats    = Math.max(...seats);

  // ── Score each flight ─────────────────────────────────
  const scored = flights.map(f => {
    // Lower price → higher score (invert)
    const priceScore    = 1 - normalise(f.displayPrice, minPrice, maxPrice);
    // Lower duration → higher score (invert)
    const durationScore = 1 - normalise(f.durationMin, minDuration, maxDuration);
    // Higher rating → higher score
    const ratingScore   = normalise(f.rating, minRating, maxRating);
    // More seats → slightly better (availability signal)
    const seatScore     = normalise(f.seatsLeft, minSeats, maxSeats);
    // Non-stop bonus (+0.05 per missing stop)
    const stopBonus     = f.stops === 0 ? 0.05 : 0;

    const score =
      pref.price    * priceScore    +
      pref.duration * durationScore +
      pref.rating   * ratingScore   +
      pref.seats    * seatScore     +
      stopBonus;

    return { ...f, _score: score };
  });

  // ── Sort descending by score ──────────────────────────
  scored.sort((a, b) => b._score - a._score);

  // ── Mark top-N as recommended ─────────────────────────
  const recommendedIds = new Set(scored.slice(0, topN).map(f => f.id));
  const reason         = REASON_LABEL[preference] || 'Recommended';

  return flights.map(f => ({
    ...f,
    isRecommended:        recommendedIds.has(f.id),
    recommendationReason: recommendedIds.has(f.id) ? reason : null,
    _score:               scored.find(s => s.id === f.id)?._score ?? 0,
  }));
}

/**
 * Returns a human-readable explanation for why a flight was recommended.
 *
 * @param {Object} flight
 * @param {string} preference
 */
export function getRecommendationDetail(flight, preference) {
  const details = [];

  if (flight.stops === 0)       details.push('Non-stop');
  if (flight.rating >= 4.7)     details.push(`Rated ${flight.rating}★`);
  if (flight.seatsLeft <= 5)    details.push(`Only ${flight.seatsLeft} seats left`);
  if (flight.amenities?.includes('WiFi'))   details.push('Free WiFi');
  if (flight.amenities?.includes('Meal'))   details.push('Meal included');
  if (flight.amenities?.includes('Flatbed')) details.push('Flatbed seat');

  if (preference === 'cheap')   details.unshift('Lowest fare');
  if (preference === 'fast')    details.unshift('Shortest flight');
  if (preference === 'best')    details.unshift('Highest score');

  return details.slice(0, 3).join(' · ');
}
