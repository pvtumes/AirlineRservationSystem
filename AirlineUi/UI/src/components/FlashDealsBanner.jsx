/**
 * FlashDealsBanner.jsx
 *
 * Rotating flash deals with a live countdown timer per deal.
 * Click "Claim Deal" → navigates to /results with the route pre-filled.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';

/* ── Mock deals ─────────────────────────────────────────── */
// Each deal expires at `expiresAt` (ISO string); we set these at module load
// relative to "now + hoursUntilExpiry" so the timers always feel relevant.
function makeExpiry(hours, minutes = 0) {
  const d = new Date();
  d.setHours(d.getHours() + hours, d.getMinutes() + minutes, 0, 0);
  return d.toISOString();
}

const DEALS = [
  {
    id:         1,
    badge:      'Flash Sale',
    emoji:      '⚡',
    from:       'Mumbai',
    to:         'Goa',
    fromCode:   'BOM',
    toCode:     'GOA',
    origPrice:  4500,
    dealPrice:  2800,
    savings:    '38% OFF',
    seats:      8,
    desc:       'Weekend beach escape · Limited seats',
    expiresAt:  makeExpiry(1, 47),
    grad:       'from-red-600 via-rose-600 to-orange-500',
    accentBg:   'bg-red-500/20',
    accentText: 'text-red-200',
  },
  {
    id:         2,
    badge:      'Weekend Special',
    emoji:      '🌟',
    from:       'Delhi',
    to:         'Bangkok',
    fromCode:   'DEL',
    toCode:     'BKK',
    origPrice:  25000,
    dealPrice:  18500,
    savings:    '26% OFF',
    seats:      14,
    desc:       'International getaway · Business class available',
    expiresAt:  makeExpiry(5, 30),
    grad:       'from-violet-600 via-purple-600 to-indigo-600',
    accentBg:   'bg-violet-500/20',
    accentText: 'text-violet-200',
  },
  {
    id:         3,
    badge:      'Last Minute Deal',
    emoji:      '🎯',
    from:       'Mumbai',
    to:         'Dubai',
    fromCode:   'BOM',
    toCode:     'DXB',
    origPrice:  20000,
    dealPrice:  15200,
    savings:    '24% OFF',
    seats:      3,
    desc:       'Tonight only · Fly out tomorrow morning',
    expiresAt:  makeExpiry(11, 15),
    grad:       'from-amber-500 via-orange-600 to-red-600',
    accentBg:   'bg-amber-400/20',
    accentText: 'text-amber-200',
  },
];

/* ── Countdown hook (per deal) ─────────────────────────── */
function useCountdownTo(isoTarget) {
  const [parts, setParts] = useState({ h: '00', m: '00', s: '00', expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(isoTarget) - Date.now();
      if (diff <= 0) { setParts({ h: '00', m: '00', s: '00', expired: true }); return; }
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0');
      setParts({ h, m, s, expired: false });
    };
    tick();
    const t = setInterval(tick, 1_000);
    return () => clearInterval(t);
  }, [isoTarget]);

  return parts;
}

/* ── Single deal countdown display ─────────────────────── */
function Countdown({ deal }) {
  const { h, m, s, expired } = useCountdownTo(deal.expiresAt);
  if (expired) return <span className="text-sm font-bold text-red-300">Deal expired</span>;
  return (
    <div className="flex items-center gap-1.5">
      {[h, m, s].map((val, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg w-10 h-10 flex items-center justify-center">
              <span className="text-lg font-black text-white tabular-nums leading-none">{val}</span>
            </div>
            <span className="text-[8px] text-white/50 mt-0.5 uppercase tracking-wider">
              {['HRS', 'MIN', 'SEC'][i]}
            </span>
          </div>
          {i < 2 && <span className="text-white/50 font-bold text-lg mb-3">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FLASH DEALS BANNER
══════════════════════════════════════════════════════════ */
export default function FlashDealsBanner({ isDark }) {
  const navigate  = useNavigate();
  const [idx, setIdx] = useState(0);
  const deal = DEALS[idx];

  // Auto-advance every 8 seconds
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % DEALS.length), 8_000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setIdx(i => (i - 1 + DEALS.length) % DEALS.length);
  const next = () => setIdx(i => (i + 1) % DEALS.length);

  const handleClaim = () => {
    navigate('/results', {
      state: { from: deal.from, to: deal.to, date: '', passengers: 1, tripClass: 'economy', tripType: 'one-way' },
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${deal.grad} shadow-2xl shadow-black/20`}
      style={{ transition: 'background 0.6s ease' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative px-5 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">

          {/* Left — badge + route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Zap size={14} className="text-yellow-300 fill-yellow-300" />
              <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${deal.accentBg} ${deal.accentText} border border-white/10`}>
                {deal.badge}
              </span>
              {deal.seats <= 5 && (
                <span className="text-xs font-bold text-yellow-300 animate-pulse">
                  🔥 Only {deal.seats} seats left!
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {deal.emoji} {deal.from}
                <span className="text-white/50 mx-2">→</span>
                {deal.to}
              </h3>
            </div>

            <p className="text-sm text-white/70 mb-4">{deal.desc}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="text-4xl font-black text-white">
                ₹{deal.dealPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-lg line-through text-white/40 font-medium">
                ₹{deal.origPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-black px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                {deal.savings}
              </div>
            </div>
          </div>

          {/* Right — countdown + CTA */}
          <div className="flex flex-col items-start lg:items-end gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">
                <Clock size={10}/> Offer expires in
              </div>
              <Countdown deal={deal} />
            </div>
            <button
              onClick={handleClaim}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-black text-sm shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <Tag size={15}/> Claim This Deal
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {DEALS.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-2">
            <button onClick={prev}
              className="w-8 h-8 rounded-full bg-black/20 border border-white/20 hover:bg-black/30 flex items-center justify-center text-white transition-all">
              <ChevronLeft size={15}/>
            </button>
            <button onClick={next}
              className="w-8 h-8 rounded-full bg-black/20 border border-white/20 hover:bg-black/30 flex items-center justify-center text-white transition-all">
              <ChevronRight size={15}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
