import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plane, ArrowLeft, Wifi, Utensils, Monitor,
  Star, Filter, ChevronDown, ChevronUp,
  AlertCircle, Luggage, Zap, Sparkles,
  TrendingDown, Gauge, Trophy, Users, Clock3,
} from 'lucide-react';
import { useTheme }        from '../context/ThemeContext';
import { useAuth }         from '../context/AuthContext';
import { searchFlights }   from '../services/flightService';
import { recommendFlights, getRecommendationDetail } from '../services/recommendationService';

/* ═══════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════ */
function SkeletonCard({ isDark }) {
  const bar = isDark ? 'bg-white/[0.06]' : 'bg-slate-200';
  return (
    <div className={`rounded-2xl border p-5 animate-pulse ${isDark ? 'bg-[#0F1929] border-white/[0.06]' : 'bg-white border-black/[0.06]'}`}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${bar}`} />
          <div className="space-y-2">
            <div className={`h-3 w-24 rounded ${bar}`} />
            <div className={`h-2.5 w-14 rounded ${bar}`} />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className={`h-5 w-32 rounded ${bar}`} />
          <div className={`h-2 w-20 rounded ${bar}`} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`h-5 w-20 rounded ${bar}`} />
          <div className={`h-8 w-24 rounded-xl ${bar}`} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AMENITY BADGE
═══════════════════════════════════════════════════════════ */
function AmenityBadge({ name, isDark }) {
  const iconMap = {
    WiFi:          <Wifi size={10} />,
    Meal:          <Utensils size={10} />,
    Entertainment: <Monitor size={10} />,
    Snack:         <Zap size={10} />,
    Flatbed:       <Luggage size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-white/[0.06] text-white/50' : 'bg-slate-100 text-slate-500'}`}>
      {iconMap[name] ?? <Zap size={10} />} {name}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   RECOMMENDED BANNER
═══════════════════════════════════════════════════════════ */
function RecommendedBadge({ reason, detail }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#1956D6] to-[#3B82F6] text-white shadow-md shadow-[#1956D6]/25">
        <Sparkles size={10} className="fill-white" />
        {reason}
      </span>
      {detail && (
        <span className="text-[10px] text-[#1956D6] dark:text-blue-400 font-medium">{detail}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLIGHT CARD
═══════════════════════════════════════════════════════════ */
function FlightCard({ flight, isDark, preference }) {
  const navigate   = useNavigate();
  const priceStr   = `₹${flight.displayPrice.toLocaleString('en-IN')}`;
  const isReco     = flight.isRecommended;
  const detail     = isReco ? getRecommendationDetail(flight, preference) : null;

  const cardBase = isDark
    ? 'bg-[#0F1929] border-white/[0.07]'
    : 'bg-white border-black/[0.07]';
  const cardReco = isDark
    ? 'bg-[#0A1836] border-[#1956D6]/40 shadow-[0_0_0_1px_rgba(25,86,214,0.25)]'
    : 'bg-[#F0F5FF] border-[#1956D6]/30 shadow-[0_0_0_1px_rgba(25,86,214,0.12)]';

  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  const handleSelect = () => {
    navigate(`/booking/${flight.id}`, { state: { flight, searchParams: { preference } } });
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl ${isReco ? cardReco : cardBase} hover:border-[#1956D6]/30`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleSelect()}
    >
      {/* Recommended badge */}
      {isReco && <RecommendedBadge reason={flight.recommendationReason} detail={detail} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Airline */}
        <div className="flex items-center gap-3 sm:w-44 shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0"
            style={{ background: flight.airline.color }}
          >
            {flight.airlineCode}
          </div>
          <div>
            <div className={`text-sm font-bold ${textH}`}>{flight.airline.name}</div>
            <div className={`text-xs ${textS}`}>{flight.flightNo}</div>
            <div className={`text-[10px] mt-0.5 font-medium ${textS}`}>ID: {flight.id}</div>
          </div>
        </div>

        {/* Route timeline */}
        <div className="flex-1 flex items-center gap-3">
          <div className="text-center">
            <div className={`text-2xl font-bold tabular-nums ${textH}`}>{flight.departureTime}</div>
            <div className={`text-xs font-semibold text-[#1956D6]`}>{flight.fromCode}</div>
            <div className={`text-[10px] ${textS}`}>{flight.from}</div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <div className={`text-[10px] font-medium flex items-center gap-1 ${textS}`}>
              <Clock3 size={10} /> {flight.durationLabel}
            </div>
            <div className="relative w-full flex items-center">
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <Plane size={14} className="text-[#1956D6] mx-1 -rotate-45" />
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>
            <div className={`text-[10px] font-semibold ${flight.stops === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {flight.stops === 0
                ? '✦ Non-stop'
                : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}${flight.stopCity ? ` via ${flight.stopCity}` : ''}`}
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold tabular-nums ${textH}`}>{flight.arrivalTime}</div>
            <div className={`text-xs font-semibold text-[#1956D6]`}>{flight.toCode}</div>
            <div className={`text-[10px] ${textS}`}>{flight.to}</div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="sm:w-44 shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className={`text-xs font-semibold ${textH}`}>{flight.rating}</span>
            <span className={`text-[10px] ${textS}`}>({flight.seatsLeft} seats)</span>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-[#1956D6]">{priceStr}</div>
            <div className={`text-[10px] ${textS}`}>
              {flight.passengers > 1 ? `${flight.passengers} × ₹${(flight.displayPrice / flight.passengers).toLocaleString('en-IN')}` : 'per person'} · {flight.selectedClass}
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); handleSelect(); }}
            className={`btn-primary px-5 py-2 text-xs rounded-xl whitespace-nowrap ${isReco ? 'shadow-lg shadow-[#1956D6]/30' : ''}`}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Footer: amenities + seat warning */}
      {(flight.amenities?.length > 0 || flight.seatsLeft <= 5) && (
        <div className={`mt-3 pt-3 border-t flex flex-wrap items-center gap-1.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <span className={`text-[10px] font-semibold mr-1 ${textS}`}>Includes:</span>
          {flight.amenities?.map(a => <AmenityBadge key={a} name={a} isDark={isDark} />)}
          {flight.seatsLeft <= 5 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 ml-auto">
              🔥 Only {flight.seatsLeft} seats
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FILTER SIDEBAR
═══════════════════════════════════════════════════════════ */
function FilterPanel({ flights, filters, setFilters, isDark }) {
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  const airlines = useMemo(() => [...new Set(flights.map(f => f.airline.name))], [flights]);
  const maxPrice = useMemo(() => Math.max(...flights.map(f => f.displayPrice), 0), [flights]);
  const minPrice = useMemo(() => Math.min(...flights.map(f => f.displayPrice), 0), [flights]);

  const reset = () => setFilters({ stops: -1, maxPrice, airlines: null, minPrice: 0 });

  return (
    <div className={`border rounded-2xl p-5 space-y-6 sticky top-20 ${card}`}>
      <div className="flex items-center justify-between">
        <div className={`text-sm font-bold ${textH}`}>Filters</div>
        <button onClick={reset} className="text-[11px] text-[#1956D6] font-semibold hover:underline">Reset</button>
      </div>

      {/* Stops */}
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${textS}`}>Stops</div>
        {[
          { label: 'Any',      value: -1 },
          { label: 'Non-stop', value: 0  },
          { label: '1 Stop',   value: 1  },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input
              type="radio"
              name="stops"
              checked={filters.stops === opt.value}
              onChange={() => setFilters(f => ({ ...f, stops: opt.value }))}
              className="accent-[#1956D6]"
            />
            <span className={`text-sm transition-colors group-hover:text-[#1956D6] ${filters.stops === opt.value ? 'text-[#1956D6] font-semibold' : textH}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      {/* Price range */}
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${textS}`}>Max Price</div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice || 100000}
          step={500}
          value={filters.maxPrice ?? maxPrice}
          onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[#1956D6]"
        />
        <div className="flex justify-between mt-1.5">
          <span className={`text-[10px] ${textS}`}>₹{minPrice.toLocaleString('en-IN')}</span>
          <span className="text-sm font-bold text-[#1956D6]">
            ₹{(filters.maxPrice ?? maxPrice).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Airlines */}
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${textS}`}>Airlines</div>
        {airlines.map(name => (
          <label key={name} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={!filters.airlines || filters.airlines.includes(name)}
              onChange={e => {
                setFilters(f => {
                  const cur = f.airlines || airlines;
                  return {
                    ...f,
                    airlines: e.target.checked
                      ? [...cur, name]
                      : cur.filter(a => a !== name),
                  };
                });
              }}
              className="accent-[#1956D6]"
            />
            <span className={`text-sm transition-colors group-hover:text-[#1956D6] ${textH}`}>{name}</span>
          </label>
        ))}
      </div>

      {/* Route type */}
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${textS}`}>Route Type</div>
        {[
          { label: 'All',           value: null },
          { label: 'Domestic',      value: 'domestic' },
          { label: 'International', value: 'international' },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input
              type="radio"
              name="routeType"
              checked={(filters.routeType ?? null) === opt.value}
              onChange={() => setFilters(f => ({ ...f, routeType: opt.value }))}
              className="accent-[#1956D6]"
            />
            <span className={`text-sm transition-colors group-hover:text-[#1956D6] ${textH}`}>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Seats available */}
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${textS}`}>Availability</div>
        <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!filters.highAvailability}
            onChange={e => setFilters(f => ({ ...f, highAvailability: e.target.checked }))}
            className="accent-[#1956D6]"
          />
          <span className={`text-sm group-hover:text-[#1956D6] transition-colors ${textH}`}>
            High availability (&gt;10 seats)
          </span>
        </label>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREFERENCE TOGGLE (cheap / fast / best)
═══════════════════════════════════════════════════════════ */
const PREFERENCES = [
  { key: 'cheap', label: 'Cheapest',  icon: TrendingDown },
  { key: 'fast',  label: 'Fastest',   icon: Gauge },
  { key: 'best',  label: 'Best',      icon: Trophy },
];

function PreferenceTabs({ value, onChange, isDark }) {
  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`}>
      {PREFERENCES.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            value === key
              ? 'bg-[#1956D6] text-white shadow-md shadow-[#1956D6]/30 scale-[1.02]'
              : isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Icon size={13} /> {label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DOMESTIC / INTERNATIONAL HELPER
═══════════════════════════════════════════════════════════ */
const DOMESTIC_CODES = new Set(['BOM','DEL','BLR','MAA','CCU','HYD','PNQ','AMD','JAI','GOI']);
function isDomesticFlight(f) {
  return DOMESTIC_CODES.has(f.fromCode) && DOMESTIC_CODES.has(f.toCode);
}

/* ═══════════════════════════════════════════════════════════
   SEARCH RESULTS PAGE
═══════════════════════════════════════════════════════════ */
export default function SearchResults() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const { user }   = useAuth();

  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [preference,  setPreference]  = useState('best');
  const [filters,     setFilters]     = useState({ stops: -1, maxPrice: null, airlines: null, routeType: null, highAvailability: false });
  const [showFilter,  setShowFilter]  = useState(true);

  // Protected route
  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Fetch flights
  useEffect(() => {
    if (!state) { navigate('/dashboard', { replace: true }); return; }
    setLoading(true);
    setError(null);
    searchFlights(state)
      .then(data => {
        setResults(data);
        const maxP = Math.max(...data.map(d => d.displayPrice), 0);
        setFilters(f => ({ ...f, maxPrice: maxP }));
      })
      .catch(() => setError('Could not load flights. Please try again.'))
      .finally(() => setLoading(false));
  }, [state]);

  // Apply recommendations + filters + sort
  const displayed = useMemo(() => {
    if (!results.length) return [];

    // Recommendation scoring
    let list = recommendFlights(results, preference, 3);

    // Filters
    if (filters.stops >= 0)
      list = list.filter(f => f.stops === filters.stops);
    if (filters.maxPrice !== null)
      list = list.filter(f => f.displayPrice <= filters.maxPrice);
    if (filters.airlines)
      list = list.filter(f => filters.airlines.includes(f.airline.name));
    if (filters.routeType === 'domestic')
      list = list.filter(f => isDomesticFlight(f));
    if (filters.routeType === 'international')
      list = list.filter(f => !isDomesticFlight(f));
    if (filters.highAvailability)
      list = list.filter(f => f.seatsLeft > 10);

    // Sort: recommended first, then by chosen preference
    list.sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      if (preference === 'cheap')   return a.displayPrice - b.displayPrice;
      if (preference === 'fast')    return a.durationMin  - b.durationMin;
      return b._score - a._score;
    });

    return list;
  }, [results, preference, filters]);

  // ── Styles ──────────────────────────────────────────────
  const bg    = isDark ? 'bg-[#060B17]'  : 'bg-[#F4F7FF]';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  const recoCount  = displayed.filter(f => f.isRecommended).length;

  if (!user) return null;

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Sticky top bar ── */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]'}`}>
        <div className="container h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors shrink-0 ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {state && (
            <div className={`flex flex-wrap items-center gap-2 text-sm font-bold ${textH}`}>
              <span>{state.from || 'Any'}</span>
              <Plane size={13} className="text-[#1956D6] -rotate-45" />
              <span>{state.to || 'Any'}</span>
              {state.date && <span className={`text-xs font-medium ${textS}`}>· {state.date}</span>}
              <span className={`text-xs font-medium ${textS}`}>
                · <Users size={11} className="inline" /> {state.passengers || 1} · {state.tripClass || 'economy'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">

        {/* ── Controls bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* Preference tabs */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${textS}`}>Recommend by:</span>
            <PreferenceTabs value={preference} onChange={setPreference} isDark={isDark} />
          </div>

          <div className="flex items-center gap-3">
            {!loading && (
              <div className={`text-xs ${textS}`}>
                <span className="font-bold text-[#1956D6]">{recoCount}</span> recommended · {displayed.length} total
              </div>
            )}
            <button
              onClick={() => setShowFilter(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-[#1956D6]/40 hover:text-[#1956D6]' : 'border-black/10 text-slate-500 hover:border-[#1956D6]/40 hover:text-[#1956D6]'}`}
            >
              <Filter size={13} />
              Filters
              {showFilter ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-5">

          {/* Filter sidebar */}
          {showFilter && !loading && results.length > 0 && (
            <div className="w-60 shrink-0 hidden md:block">
              <FilterPanel
                flights={results}
                filters={filters}
                setFilters={setFilters}
                isDark={isDark}
              />
            </div>
          )}

          {/* Results column */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Skeleton */}
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} isDark={isDark} />)}

            {/* Error */}
            {!loading && error && (
              <div className={`flex flex-col items-center justify-center py-20 gap-4 border rounded-2xl ${card}`}>
                <AlertCircle size={36} className="text-red-400" />
                <div className="text-center">
                  <p className={`font-bold ${textH}`}>Something went wrong</p>
                  <p className={`text-sm mt-1 ${textS}`}>{error}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2 text-sm rounded-xl">
                  Back to search
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && displayed.length === 0 && (
              <div className={`flex flex-col items-center justify-center py-20 gap-4 border rounded-2xl ${card}`}>
                <Plane size={40} className="text-[#1956D6] opacity-25" />
                <div className="text-center">
                  <p className={`text-base font-bold ${textH}`}>No flights found</p>
                  <p className={`text-sm mt-1 ${textS}`}>Try adjusting your filters or search again.</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2 text-sm rounded-xl">
                  New search
                </button>
              </div>
            )}

            {/* Recommended flights section */}
            {!loading && !error && recoCount > 0 && (
              <div className={`flex items-center gap-2 py-2 px-1 ${textS}`}>
                <Sparkles size={14} className="text-[#1956D6]" />
                <span className="text-xs font-semibold">
                  <span className="text-[#1956D6]">{recoCount} recommended</span> flights highlighted below
                </span>
              </div>
            )}

            {/* Flight cards */}
            {!loading && !error && displayed.map(f => (
              <FlightCard key={f.id} flight={f} isDark={isDark} preference={preference} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
