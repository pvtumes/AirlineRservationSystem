/**
 * DestinationCarousel.jsx
 *
 * Inspiration carousel with destination cards, auto-play,
 * and direct navigation to the results page.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plane, MapPin, TrendingUp, Star } from 'lucide-react';

/* ── Destination data ───────────────────────────────────── */
export const DESTINATIONS = [
  {
    city: 'Goa',  country: 'India', emoji: '🏖️',
    from: 'Mumbai', to: 'Goa', fromCode: 'BOM', toCode: 'GOA',
    price: 2800, tag: 'Top Pick', season: 'Best Oct–Mar',
    desc: 'Pristine beaches, vibrant nightlife, and Portuguese heritage',
    grad: ['#0EA5E9', '#0369A1', '#075985'],
    accent: '#38BDF8',
    spots: ['Baga Beach', 'Old Goa', 'Dudhsagar Falls'],
  },
  {
    city: 'Bangkok', country: 'Thailand', emoji: '🏮',
    from: 'Delhi', to: 'Bangkok', fromCode: 'DEL', toCode: 'BKK',
    price: 18500, tag: 'International', season: 'Best Nov–Feb',
    desc: 'Street food, ornate temples, and a buzzing nightlife scene',
    grad: ['#F97316', '#C2410C', '#7C2D12'],
    accent: '#FB923C',
    spots: ['Chatuchak Market', 'Wat Pho', 'Khao San Road'],
  },
  {
    city: 'Dubai', country: 'UAE', emoji: '🌆',
    from: 'Mumbai', to: 'Dubai', fromCode: 'BOM', toCode: 'DXB',
    price: 15200, tag: 'Trending', season: 'Best Nov–Mar',
    desc: 'Iconic skyline, world-class shopping, and desert adventures',
    grad: ['#D4A017', '#B8730A', '#7A4E0A'],
    accent: '#FCD34D',
    spots: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'],
  },
  {
    city: 'Singapore', country: 'Singapore', emoji: '🦁',
    from: 'Mumbai', to: 'Singapore', fromCode: 'BOM', toCode: 'SIN',
    price: 22000, tag: 'Must Visit', season: 'Year-round',
    desc: 'A stunning city-state blending cultures, cuisines, and innovation',
    grad: ['#059669', '#047857', '#064E3B'],
    accent: '#34D399',
    spots: ['Gardens by the Bay', 'Sentosa', 'Marina Bay Sands'],
  },
  {
    city: 'Maldives', country: 'Maldives', emoji: '🐠',
    from: 'Mumbai', to: 'Malé', fromCode: 'BOM', toCode: 'MLE',
    price: 35000, tag: 'Luxury', season: 'Best Dec–Apr',
    desc: 'Crystal-clear lagoons, overwater bungalows, and marine life',
    grad: ['#0891B2', '#0E7490', '#164E63'],
    accent: '#22D3EE',
    spots: ['North Malé Atoll', 'Baa Atoll', 'Ari Atoll'],
  },
  {
    city: 'Manali', country: 'India', emoji: '🏔️',
    from: 'Delhi', to: 'Kullu', fromCode: 'DEL', toCode: 'KUU',
    price: 4200, tag: 'Adventure', season: 'Best May–Jun',
    desc: 'Snow-capped peaks, roaring rivers, and thrilling mountain trails',
    grad: ['#7C3AED', '#6D28D9', '#4C1D95'],
    accent: '#A78BFA',
    spots: ['Rohtang Pass', 'Solang Valley', 'Old Manali'],
  },
];

/* ── Destination SVG scene (decorative) ─────────────────── */
function ScenePattern({ emoji, accent }) {
  return (
    <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden">
      {/* Big emoji watermark */}
      <div className="text-[120px] sm:text-[160px] leading-none opacity-15 blur-[1px]">{emoji}</div>
      {/* Floating circles */}
      <div className="absolute top-4 left-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: accent, filter: 'blur(40px)' }} />
      <div className="absolute bottom-4 right-16 w-24 h-24 rounded-full opacity-10"
        style={{ background: accent, filter: 'blur(30px)' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
    </div>
  );
}

/* ── Individual card ─────────────────────────────────────── */
function DestCard({ dest, active, navigate }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer select-none shrink-0 transition-all duration-500 group ${active ? 'ring-2 ring-white/30 shadow-2xl' : 'opacity-60 scale-95'}`}
      style={{
        width: 'var(--card-w)',
        background: `linear-gradient(135deg, ${dest.grad[0]}, ${dest.grad[1]}, ${dest.grad[2]})`,
        minHeight: '260px',
      }}
      onClick={() => navigate('/results', {
        state: { from: dest.from, to: dest.to, date: '', passengers: 1, tripClass: 'economy', tripType: 'one-way' },
      })}
    >
      <ScenePattern emoji={dest.emoji} accent={dest.accent} />

      <div className="relative p-5 h-full flex flex-col justify-between min-h-[260px]">
        {/* Top badges */}
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-sm">
            {dest.tag}
          </span>
          <span className="text-[10px] font-bold text-white/60 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
            {dest.season}
          </span>
        </div>

        {/* Middle — emoji + destination */}
        <div className="my-auto py-4">
          <div className="text-5xl mb-2">{dest.emoji}</div>
          <h3 className="text-2xl font-black text-white leading-tight">{dest.city}</h3>
          <div className="flex items-center gap-1 text-white/60 text-xs font-semibold mt-0.5">
            <MapPin size={10}/> {dest.country}
          </div>
          <p className="text-xs text-white/70 mt-2 leading-relaxed line-clamp-2">{dest.desc}</p>
        </div>

        {/* Bottom — price + CTA */}
        <div>
          {/* Spots */}
          <div className="flex flex-wrap gap-1 mb-3">
            {dest.spots.slice(0, 2).map(s => (
              <span key={s} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-black/20 text-white/60 backdrop-blur-sm">
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-white/50 font-semibold">Flights from</div>
              <div className="text-xl font-black text-white">
                ₹{dest.price.toLocaleString('en-IN')}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl text-white transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg`}
              style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)' }}>
              <Plane size={12} className="-rotate-45"/> Explore
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DESTINATION CAROUSEL
══════════════════════════════════════════════════════════ */
export default function DestinationCarousel({ isDark }) {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused,    setPaused]    = useState(false);
  const trackRef  = useRef(null);

  const n = DESTINATIONS.length;

  // Auto-advance every 4s (pause on hover)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActiveIdx(i => (i + 1) % n), 4_000);
    return () => clearInterval(t);
  }, [paused, n]);

  const prev = useCallback(() => setActiveIdx(i => (i - 1 + n) % n), [n]);
  const next = useCallback(() => setActiveIdx(i => (i + 1) % n), [n]);

  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-lg font-bold ${textH}`}>Destination Inspiration</h2>
          <p className={`text-xs mt-0.5 ${textS}`}>Discover trending getaways — click any card to explore flights</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isDark ? 'border-white/10 text-white/50 hover:border-white/30 hover:text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'}`}>
            <ChevronLeft size={15}/>
          </button>
          <button onClick={next}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isDark ? 'border-white/10 text-white/50 hover:border-white/30 hover:text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'}`}>
            <ChevronRight size={15}/>
          </button>
        </div>
      </div>

      {/* Responsive card widths via CSS var */}
      <style>{`
        :root { --card-w: min(320px, 80vw); }
        @media (min-width: 640px)  { :root { --card-w: 300px; } }
        @media (min-width: 1024px) { :root { --card-w: 320px; } }
      `}</style>

      {/* Carousel track */}
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${activeIdx} * (var(--card-w) + 16px)))` }}
        >
          {DESTINATIONS.map((dest, i) => (
            <DestCard key={dest.city} dest={dest} active={i === activeIdx} navigate={navigate} />
          ))}
        </div>

        {/* Fade edges */}
        <div className={`absolute top-0 left-0 h-full w-6 pointer-events-none z-10 ${isDark ? 'bg-gradient-to-r from-[#060B17]' : 'bg-gradient-to-r from-[#F4F7FF]'}`} />
        <div className={`absolute top-0 right-0 h-full w-12 pointer-events-none z-10 ${isDark ? 'bg-gradient-to-l from-[#060B17]' : 'bg-gradient-to-l from-[#F4F7FF]'}`} />
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {DESTINATIONS.map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-6 h-2 bg-[#1956D6]' : `w-2 h-2 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`}`}
          />
        ))}
      </div>

      {/* "More inspiration" row */}
      <div className={`mt-4 flex flex-wrap items-center gap-3 justify-center`}>
        <span className={`text-xs ${textS}`}>Also popular:</span>
        {['Jaipur · ₹3,100', 'Hyderabad · ₹4,500', 'Kerala · ₹5,200', 'Kolkata · ₹3,800'].map(r => (
          <button key={r}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all hover:border-[#1956D6]/40 hover:text-[#1956D6] ${isDark ? 'border-white/10 text-white/50' : 'border-slate-200 text-slate-500'}`}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
