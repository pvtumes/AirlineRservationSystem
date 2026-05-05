import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Plane, ArrowLeft, Clock3, Users, CreditCard, CheckCircle,
  Wifi, Utensils, Monitor, Luggage, Zap, Star, Shield, Tag,
  Calendar, MapPin, ChevronRight, ChevronLeft, Sparkles,
  Leaf, Drumstick, Info, AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getFlightById } from '../services/flightService';
import { fetchSeatMapAPI, createBooking, getSeatExtraPrice } from '../services/bookingService';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const STEPS = [
  { id: 1, label: 'Passengers' },
  { id: 2, label: 'Seat Selection' },
  { id: 3, label: 'Meals' },
  { id: 4, label: 'Payment' },
];

const AMENITY_ICONS = {
  WiFi: <Wifi size={13} />, Meal: <Utensils size={13} />,
  Entertainment: <Monitor size={13} />, Snack: <Zap size={13} />,
  Flatbed: <Luggage size={13} />,
};

/* ═══════════════════════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════════════════════ */
function StepBar({ step, isDark }) {
  const textS = isDark ? 'text-white/40' : 'text-slate-400';
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === s.id
                ? 'bg-[#1956D6] text-white scale-110 shadow-lg shadow-[#1956D6]/30'
                : step > s.id
                  ? 'bg-emerald-500 text-white'
                  : isDark ? 'bg-white/[0.07] text-white/30' : 'bg-slate-100 text-slate-400'
              }`}>
              {step > s.id ? <CheckCircle size={16} /> : s.id}
            </div>
            <span className={`text-[10px] font-semibold whitespace-nowrap ${step >= s.id ? 'text-[#1956D6]' : textS}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-10 sm:w-16 mb-5 transition-all duration-500 ${step > s.id ? 'bg-emerald-500' : isDark ? 'bg-white/[0.07]' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 — PASSENGER DETAILS
═══════════════════════════════════════════════════════════ */
function PassengerStep({ passengers, count, onChange, onNext, isDark }) {
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const fieldCls = `w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:border-[#1956D6]/60 focus:ring-2 focus:ring-[#1956D6]/10 ${isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/25' : 'bg-white border-black/10 text-slate-800 placeholder-slate-400'
    }`;

  const allFilled = passengers.every(p =>
    p.name.trim() && p.email.trim() && p.phone.trim() && p.age && p.gender
  );

  const update = (idx, field, val) => {
    const arr = [...passengers];
    arr[idx] = { ...arr[idx], [field]: val };
    onChange(arr);
  };

  const addPassenger = () => {
    onChange([...passengers, { name: '', email: '', phone: '', dob: '', age: '', gender: '' }]);
  };

  const removePassenger = (idx) => {
    const arr = [...passengers];
    arr.splice(idx, 1);
    onChange(arr);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-bold ${textH}`}>Passenger Details</h2>
        <p className={`text-sm mt-1 ${textS}`}>{count} passenger{count > 1 ? 's' : ''} · Fill in details for all travellers</p>
      </div>
      {passengers.map((p, i) => (
        <div key={i} className={`rounded-2xl border p-5 space-y-3 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold ${textH} flex items-center gap-2`}>
              <span className="w-6 h-6 rounded-full bg-[#1956D6] text-white text-xs flex items-center justify-center">{i + 1}</span>
              {i === 0 ? 'Primary Passenger' : `Passenger ${i + 1}`}
            </p>
            {i > 0 && (
              <button 
                type="button" 
                onClick={() => removePassenger(i)} 
                className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
               >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textS}`}>Full Name *</label>
              <input className={fieldCls} placeholder="e.g. Rahul Sharma" value={p.name} onChange={e => update(i, 'name', e.target.value)} />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textS}`}>Email *</label>
              <input className={fieldCls} type="email" placeholder="rahul@email.com" value={p.email} onChange={e => update(i, 'email', e.target.value)} />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textS}`}>Phone *</label>
              <input
                className={fieldCls}
                type="tel"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={p.phone}
                onChange={e => update(i, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textS}`}>Age *</label>
              <input
                className={fieldCls}
                type="number"
                min="1" max="120"
                placeholder="e.g. 28"
                value={p.age ?? ''}
                onChange={e => update(i, 'age', e.target.value)}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textS}`}>Gender *</label>
              <select
                className={`${fieldCls} ${isDark ? '[color-scheme:dark]' : ''}`}
                value={p.gender ?? ''}
                onChange={e => update(i, 'gender', e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textS}`}>Date of Birth</label>
              <input
                className={`${fieldCls} [color-scheme:${isDark ? 'dark' : 'light'}]`}
                type="date"
                value={p.dob ?? ''}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => update(i, 'dob', e.target.value)}
              />
            </div>

          </div>
        </div>
      ))}
      <button 
        type="button" 
        onClick={addPassenger} 
        className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
          isDark ? 'border-white/20 text-white/60 hover:bg-white/[0.04] hover:text-white' : 'border-[#1956D6]/30 text-[#1956D6] hover:bg-[#1956D6]/5'
        }`}
      >
        + Add Another Passenger
      </button>

      <button onClick={onNext} disabled={!allFilled} className="btn-primary w-full py-4 rounded-xl gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
        Continue to Seat Selection <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 2 — SEAT SELECTION  (Airplane Cabin UI)
═══════════════════════════════════════════════════════════ */

/* ── Seat status legend ── */
function SeatLegend({ isDark }) {
  const items = [
    { bg: 'bg-[#1956D6]',   border: 'border-[#1956D6]',   label: 'Selected' },
    { bg: 'bg-emerald-500', border: 'border-emerald-500',  label: 'Available' },
    { bg: 'bg-slate-400',   border: 'border-slate-400',    label: 'Booked' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-5 mb-2">
      {items.map(it => (
        <div key={it.label} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-md border-2 ${it.bg} ${it.border}`} />
          <span className={`text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{it.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-md border-2 border-dashed ${isDark ? 'border-white/20' : 'border-slate-300'}`} />
        <span className={`text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-500'}`}>No Seat</span>
      </div>
    </div>
  );
}

/* ── Individual seat button ── */
function AirplaneSeat({ seat, isSelected, onToggle, isDark }) {
  if (!seat) {
    // Empty gap (no physical seat)
    return <div className="w-9 h-10" />;
  }

  const isBooked = seat.status === 'booked';
  const isWindow = seat.label === 'A' || seat.label === 'F' || seat.label === 'S';

  let seatCls, textCls;
  if (isBooked) {
    seatCls = isDark
      ? 'bg-slate-700/60 border-slate-600 cursor-not-allowed'
      : 'bg-slate-200 border-slate-300 cursor-not-allowed';
    textCls = isDark ? 'text-slate-500' : 'text-slate-400';
  } else if (isSelected) {
    seatCls = 'bg-[#1956D6] border-[#1956D6] shadow-lg shadow-[#1956D6]/40 scale-105 cursor-pointer';
    textCls = 'text-white font-bold';
  } else {
    seatCls = isDark
      ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/40 hover:border-emerald-400 hover:scale-105 cursor-pointer'
      : 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100 hover:border-emerald-500 hover:scale-105 cursor-pointer';
    textCls = isDark ? 'text-emerald-300' : 'text-emerald-700';
  }

  const posLabel = isWindow ? '🪟' : (seat.label === 'C' || seat.label === 'D') ? '🚶' : '💺';
  const tooltip = isBooked
    ? `Seat ${seat.id} — Booked`
    : `Seat ${seat.id} · ${seat.class} · +₹${seat.extraPrice || 0} · ${isWindow ? 'Window' : (seat.label === 'C' || seat.label === 'D') ? 'Aisle' : 'Middle'}`;

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => !isBooked && onToggle(seat.id)}
      title={tooltip}
      className={`relative w-9 h-10 rounded-t-xl rounded-b-sm border-2 text-[9px] flex flex-col items-center justify-center gap-0 transition-all duration-150 select-none ${seatCls}`}
      style={{ minWidth: '36px' }}
    >
      {/* Seat back arc */}
      <span className={`text-[8px] leading-none ${textCls}`}>{seat.id}</span>
      {isSelected && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white flex items-center justify-center">
          <span className="block w-1.5 h-1.5 rounded-full bg-[#1956D6]" />
        </span>
      )}
    </button>
  );
}

/* ── Full airplane cabin map ── */
function AirplaneCabinMap({ rows, cabinClass, selected, onToggle, isDark, maxSeats }) {
  const isBusiness = cabinClass === 'business';

  // Column config
  // Business: A B | C D  (2+2)
  // Economy:  A B C | D E F  (3+3)
  // But API returns economy as S4, S5 (label='S') — we treat all as sequential
  // Detect column count from actual data
  const leftCount  = isBusiness ? 2 : 3;
  const rightCount = isBusiness ? 2 : 3;

  const leftLabels  = isBusiness ? ['A', 'B']       : ['A', 'B', 'C'];
  const rightLabels = isBusiness ? ['C', 'D']       : ['D', 'E', 'F'];

  // Build a column-aware row structure
  // Each row: group seats into left/right based on position
  const buildCols = (seats) => {
    const left  = seats.slice(0, leftCount);
    const right = seats.slice(leftCount, leftCount + rightCount);
    // Pad shorter sides
    while (left.length  < leftCount)  left.push(null);
    while (right.length < rightCount) right.push(null);
    return { left, right };
  };

  const panelCls = isDark
    ? 'bg-[#0A1628] border-[#1E3A5F]'
    : 'bg-slate-50 border-slate-200';

  const aisleLabel = isDark ? 'text-white/15' : 'text-slate-300';

  return (
    <div className={`relative rounded-3xl border-2 overflow-hidden ${panelCls}`} style={{ maxWidth: 420, margin: '0 auto' }}>

      {/* ── Airplane nose ── */}
      <div className="flex flex-col items-center pt-5 pb-3">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${isDark ? 'bg-[#1E3A5F]' : 'bg-slate-200'}`}>
          <Plane size={28} className={`${isDark ? 'text-white/40' : 'text-slate-400'} -rotate-90`} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
          ✈ Front of Cabin
        </span>
      </div>

      {/* ── Column headers ── */}
      <div className="flex items-center justify-center gap-0 px-6 pb-2">
        {/* Row number placeholder */}
        <div className="w-7 shrink-0" />
        {/* Left seats labels */}
        <div className="flex gap-1 mr-1">
          {leftLabels.map(l => (
            <div key={l} className={`w-9 text-center text-[10px] font-bold tracking-wider ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{l}</div>
          ))}
        </div>
        {/* Aisle */}
        <div className="w-8 text-center">
          <span className={`text-[8px] font-bold uppercase tracking-widest ${aisleLabel}`}>aisle</span>
        </div>
        {/* Right seat labels */}
        <div className="flex gap-1 ml-1">
          {rightLabels.map(l => (
            <div key={l} className={`w-9 text-center text-[10px] font-bold tracking-wider ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{l}</div>
          ))}
        </div>
        {/* Window placeholder */}
        <div className="w-5 shrink-0" />
      </div>

      {/* ── Seat rows ── */}
      <div className="px-2 pb-6 space-y-1.5 overflow-y-auto" style={{ maxHeight: 420 }}>
        {rows.map((row, rIdx) => {
          const { left, right } = buildCols(row.seats);
          const isExitRow = rIdx > 0 && rIdx % 8 === 0;
          return (
            <React.Fragment key={row.row}>
              {/* Exit row gap */}
              {isExitRow && (
                <div className={`flex items-center gap-2 py-1 ${isDark ? 'text-amber-400/60' : 'text-amber-500'}`}>
                  <div className={`flex-1 h-px ${isDark ? 'bg-amber-400/20' : 'bg-amber-200'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Emergency Exit</span>
                  <div className={`flex-1 h-px ${isDark ? 'bg-amber-400/20' : 'bg-amber-200'}`} />
                </div>
              )}
              <div className="flex items-center justify-center gap-0 px-4">
                {/* Row number */}
                <span className={`w-7 text-[10px] text-right font-mono pr-1 shrink-0 ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
                  {row.row}
                </span>

                {/* Left seats */}
                <div className="flex gap-1 mr-1">
                  {left.map((s, si) => (
                    <AirplaneSeat
                      key={s ? s.id : `gap-l-${si}`}
                      seat={s}
                      isSelected={s ? selected.includes(s.id) : false}
                      onToggle={onToggle}
                      isDark={isDark}
                    />
                  ))}
                </div>

                {/* Aisle */}
                <div className={`w-8 flex flex-col items-center justify-center h-10 ${isDark ? 'border-x border-white/5' : 'border-x border-slate-100'}`}>
                  <span className={`text-[7px] ${isDark ? 'text-white/10' : 'text-slate-200'}`}>│</span>
                </div>

                {/* Right seats */}
                <div className="flex gap-1 ml-1">
                  {right.map((s, si) => (
                    <AirplaneSeat
                      key={s ? s.id : `gap-r-${si}`}
                      seat={s}
                      isSelected={s ? selected.includes(s.id) : false}
                      onToggle={onToggle}
                      isDark={isDark}
                    />
                  ))}
                </div>

                {/* Window dot */}
                <div className="w-5 flex items-center justify-center shrink-0">
                  <div className={`w-2.5 h-3.5 rounded-full border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'}`} />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Airplane tail ── */}
      <div className={`flex justify-center py-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-white/15' : 'text-slate-300'}`}>
          ✈ Rear of Cabin
        </span>
      </div>
    </div>
  );
}

/* ── Seat step wrapper ── */
function SeatStep({ seatMap, cabinClass, selected, onToggle, maxSeats, onNext, onBack, isDark }) {
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const rows  = cabinClass === 'business' ? seatMap.business : seatMap.economy;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold ${textH}`}>Select Your Seats</h2>
        <p className={`text-sm mt-1 ${textS}`}>
          {selected.length} of {maxSeats} seat{maxSeats > 1 ? 's' : ''} selected
          &nbsp;·&nbsp;<span className="capitalize">{cabinClass}</span> cabin
        </p>
      </div>

      {/* Legend */}
      <SeatLegend isDark={isDark} />

      {/* Cabin map */}
      {rows.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-sm font-medium ${isDark ? 'bg-white/[0.02] border-white/[0.07] text-white/40' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          No seats available for this cabin class.
        </div>
      ) : (
        <AirplaneCabinMap
          rows={rows}
          cabinClass={cabinClass}
          selected={selected}
          onToggle={onToggle}
          isDark={isDark}
          maxSeats={maxSeats}
        />
      )}

      {/* Selected seats tray */}
      {selected.length > 0 && (
        <div className={`rounded-2xl border p-4 flex items-center gap-4 ${isDark ? 'bg-[#1956D6]/10 border-[#1956D6]/25' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-blue-400/70' : 'text-blue-500'}`}>
              Selected Seats
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selected.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onToggle(s)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#1956D6] text-white flex items-center gap-1 hover:bg-[#1440B0] transition-colors"
                >
                  {s} <span className="text-[10px] opacity-70">×</span>
                </button>
              ))}
            </div>
          </div>
          <Info size={16} className={isDark ? 'text-blue-400/50 shrink-0' : 'text-blue-400 shrink-0'} />
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm transition-all
            ${isDark ? 'border-white/10 text-white/60 hover:border-[#1956D6]/40 hover:text-[#1956D6]'
                      : 'border-slate-200 text-slate-600 hover:border-[#1956D6]/40 hover:text-[#1956D6]'}`}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 btn-primary py-3.5 rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 3 — MEAL PREFERENCES
═══════════════════════════════════════════════════════════ */
function MealStep({ meals, onChange, totalPassengers, onNext, onBack, isDark }) {
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  const MEALS = [
    { key: 'veg', icon: Leaf, label: 'Vegetarian', desc: 'A delicious plant-based meal', price: 250, color: 'emerald' },
    { key: 'nonVeg', icon: Drumstick, label: 'Non-Vegetarian', desc: 'Chef-curated non-veg selection', price: 350, color: 'orange' },
  ];

  const total = meals.veg + meals.nonVeg;

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-lg font-bold ${textH}`}>Meal Preferences</h2>
        <p className={`text-sm mt-1 ${textS}`}>Choose meals for {totalPassengers} passenger{totalPassengers > 1 ? 's' : ''} · Optional · ₹250–₹350 per meal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MEALS.map(({ key, icon: Icon, label, desc, price, color }) => (
          <div key={key} className={`rounded-2xl border p-5 transition-all ${meals[key] > 0
              ? color === 'emerald'
                ? isDark ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-emerald-300 bg-emerald-50'
                : isDark ? 'border-orange-500/40 bg-orange-500/10' : 'border-orange-300 bg-orange-50'
              : isDark ? 'border-white/[0.07] bg-white/[0.02]' : 'border-slate-100 bg-white'
            }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color === 'emerald'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-orange-500/10 text-orange-500'
                }`}>
                <Icon size={22} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-white/[0.06] text-white/50' : 'bg-slate-100 text-slate-500'}`}>
                +₹{price}/meal
              </span>
            </div>
            <div className={`text-sm font-bold mb-1 ${textH}`}>{label}</div>
            <div className={`text-xs mb-4 ${textS}`}>{desc}</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange({ ...meals, [key]: Math.max(0, meals[key] - 1) })}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold transition-colors ${meals[key] > 0
                    ? 'border-[#1956D6] text-[#1956D6] hover:bg-[#1956D6]/10'
                    : isDark ? 'border-white/10 text-white/20 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                disabled={meals[key] === 0}
              >−</button>
              <span className={`text-lg font-bold w-6 text-center ${textH}`}>{meals[key]}</span>
              <button
                type="button"
                onClick={() => onChange({ ...meals, [key]: Math.min(totalPassengers, meals[key] + 1) })}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold transition-colors ${meals[key] < totalPassengers
                    ? 'border-[#1956D6] text-[#1956D6] hover:bg-[#1956D6]/10'
                    : isDark ? 'border-white/10 text-white/20 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                disabled={meals[key] >= totalPassengers}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className={`rounded-xl p-3 flex items-center gap-2 ${isDark ? 'bg-[#1956D6]/10 border border-[#1956D6]/20' : 'bg-blue-50 border border-blue-100'}`}>
          <Utensils size={13} className="text-[#1956D6]" />
          <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            {meals.veg > 0 ? `${meals.veg} veg` : ''}{meals.veg > 0 && meals.nonVeg > 0 ? ' + ' : ''}{meals.nonVeg > 0 ? `${meals.nonVeg} non-veg` : ''}
            {' '}· Meal cost: ₹{(meals.veg * 250 + meals.nonVeg * 350).toLocaleString('en-IN')}
          </span>
        </div>
      )}

      <p className={`text-xs ${textS}`}>Skip if you prefer not to pre-order meals.</p>

      <div className="flex gap-3">
        <button onClick={onBack} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-white/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="flex-1 btn-primary py-3.5 rounded-xl gap-2">
          Continue to Payment <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 4 — PAYMENT
═══════════════════════════════════════════════════════════ */
function PaymentStep({ summary, onConfirm, onBack, loading, isDark }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const fieldCls = `w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:border-[#1956D6]/60 focus:ring-2 focus:ring-[#1956D6]/10 ${isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/25' : 'bg-white border-black/10 text-slate-800 placeholder-slate-400'
    }`;

  const divider = <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'} my-2`} />;
  const row = (label, value, bold) => (
    <div className="flex justify-between text-sm py-1">
      <span className={textS}>{label}</span>
      <span className={bold ? `font-bold ${textH}` : textH}>{value}</span>
    </div>
  );

  const allFilled = card.number.replace(/\s/g, '').length >= 16 && card.expiry && card.cvv.length >= 3 && card.name.trim();

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-lg font-bold ${textH}`}>Payment</h2>
        <p className={`text-sm mt-1 ${textS}`}>Review your booking and complete payment</p>
      </div>

      {/* Price breakdown */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-slate-50 border-slate-100'}`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textS}`}>Price Breakdown</p>
        {row('Base fare', `₹${summary.basePrice.toLocaleString('en-IN')}`)}
        {summary.seatExtra > 0 && row('Seat extras', `₹${summary.seatExtra.toLocaleString('en-IN')}`)}
        {summary.mealCost > 0 && row('Meals', `₹${summary.mealCost.toLocaleString('en-IN')}`)}
        {divider}
        {row('Subtotal', `₹${summary.subtotal.toLocaleString('en-IN')}`)}
        {row('GST (12%)', `₹${summary.tax.toLocaleString('en-IN')}`)}
        {divider}
        <div className="flex justify-between font-bold text-base mt-1">
          <span className={textH}>Total Payable</span>
          <span className="text-[#1956D6]">₹{summary.totalPrice.toLocaleString('en-IN')}</span>
        </div>
        <p className={`text-[10px] mt-2 ${textS}`}>Inclusive of all taxes and fees</p>
      </div>

      {/* Card form */}
      <div className="space-y-3">
        <p className={`text-xs font-bold uppercase tracking-widest ${textS}`}>Card Details</p>
        <input
          className={fieldCls}
          placeholder="Card number"
          maxLength={19}
          value={card.number}
          onChange={e => setCard(p => ({ ...p, number: e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <input className={fieldCls} placeholder="MM / YY" maxLength={5}
            value={card.expiry}
            onChange={e => setCard(p => ({ ...p, expiry: e.target.value.replace(/[^\d/]/g, '').slice(0, 5) }))} />
          <input className={fieldCls} placeholder="CVV" maxLength={4} type="password"
            value={card.cvv}
            onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/, '').slice(0, 4) }))} />
        </div>
        <input className={fieldCls} placeholder="Name on card"
          value={card.name}
          onChange={e => setCard(p => ({ ...p, name: e.target.value }))} />
      </div>

      <div className={`rounded-xl p-3 flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
        <Shield size={14} className="text-emerald-500 shrink-0" />
        <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
          256-bit SSL encrypted · Your card details are secure
        </span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm transition-all disabled:opacity-50 ${isDark ? 'border-white/10 text-white/60 hover:border-white/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => onConfirm(card)}
          disabled={!allFilled || loading}
          className="flex-1 btn-primary py-3.5 rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing…
            </span>
          ) : (
            <><CreditCard size={16} /> Pay ₹{summary.totalPrice.toLocaleString('en-IN')}</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════════ */
function SuccessScreen({ booking, isDark }) {
  const navigate = useNavigate();
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const rowCls = `flex justify-between text-sm py-1.5 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-100'}`;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-6 anim-fade-up">
      {/* Animated checkmark */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce-slow">
          <CheckCircle size={52} className="text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#1956D6] flex items-center justify-center">
          <Sparkles size={14} className="text-white fill-white" />
        </div>
      </div>

      <div>
        <h2 className={`text-2xl font-bold ${textH}`}>Booking Successful! 🎉</h2>
        <p className={`text-sm mt-2 ${textS}`}>Your flight has been booked. Have a wonderful journey!</p>
      </div>

      {/* Booking card */}
      <div className={`w-full max-w-md rounded-2xl border p-6 text-left ${isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold uppercase tracking-widest ${textS}`}>Booking Reference</span>
          <span className="text-xl font-bold text-[#1956D6] tracking-widest">{booking.bookingRef}</span>
        </div>
        <div className="space-y-0">
          {[
            ['Flight', booking.flightNo],
            ['Passengers', booking.passengers?.length ?? 1],
            ['Seats', booking.seats?.join(', ')],
            ['Class', booking.cabinClass],
            ['Meals', `${booking.meals?.veg ?? 0} veg, ${booking.meals?.nonVeg ?? 0} non-veg`],
            ['Total Paid', `₹${booking.totalPrice?.toLocaleString('en-IN')}`],
            ['Status', '✅ Confirmed'],
          ].map(([l, v]) => (
            <div key={l} className={rowCls}>
              <span className={textS}>{l}</span>
              <span className={`font-semibold ${textH}`}>{v}</span>
            </div>
          ))}
        </div>
        <p className={`text-[11px] mt-4 ${textS}`}>
          Confirmation sent to {booking.passengers?.[0]?.email ?? 'your email'}
        </p>
      </div>

      <div className="flex gap-3 w-full max-w-md">
        <button onClick={() => navigate('/dashboard')} className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-white/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          Dashboard
        </button>
        <button onClick={() => navigate('/results')} className="flex-1 btn-primary py-3 rounded-xl text-sm gap-2">
          <Plane size={15} className="-rotate-45" /> New Search
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLIGHT SUMMARY SIDEBAR
═══════════════════════════════════════════════════════════ */
function FlightSummary({ flight, selectedSeats, meals, isDark }) {
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  if (!flight) return null;

  return (
    <div className={`border rounded-2xl p-5 space-y-4 sticky top-24 ${card}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${textS}`}>Your Flight</p>

      {/* Airline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow" style={{ background: flight.airline?.color ?? '#1956D6' }}>
          {flight.airlineCode}
        </div>
        <div>
          <div className={`text-sm font-bold ${textH}`}>{flight.airline?.name}</div>
          <div className={`text-xs ${textS}`}>{flight.flightNo}</div>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2">
        <div className="text-center">
          <div className={`text-xl font-bold tabular-nums ${textH}`}>{flight.departureTime}</div>
          <div className="text-xs font-bold text-[#1956D6]">{flight.fromCode}</div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className={`text-[10px] ${textS} flex items-center gap-1`}><Clock3 size={10} /> {flight.durationLabel}</div>
          <div className="relative w-full flex items-center">
            <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <Plane size={12} className="text-[#1956D6] mx-1 -rotate-45" />
            <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          </div>
          <div className={`text-[10px] font-semibold ${flight.stops === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
          </div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold tabular-nums ${textH}`}>{flight.arrivalTime}</div>
          <div className="text-xs font-bold text-[#1956D6]">{flight.toCode}</div>
        </div>
      </div>

      <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`} />

      {/* Seats */}
      {selectedSeats.length > 0 && (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${textS}`}>Seats</p>
          <div className="flex flex-wrap gap-1">
            {selectedSeats.map(s => (
              <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#1956D6]/10 text-[#1956D6]">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Meals */}
      {(meals.veg + meals.nonVeg) > 0 && (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${textS}`}>Meals</p>
          <p className={`text-xs ${textH}`}>
            {meals.veg > 0 ? `${meals.veg} veg` : ''}{meals.veg > 0 && meals.nonVeg > 0 ? ', ' : ''}{meals.nonVeg > 0 ? `${meals.nonVeg} non-veg` : ''}
          </p>
        </div>
      )}

      {/* Amenities */}
      {flight.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {flight.amenities.slice(0, 4).map(a => (
            <span key={a} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-white/[0.06] text-white/50' : 'bg-slate-100 text-slate-500'}`}>
              {AMENITY_ICONS[a] ?? <Zap size={10} />} {a}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-50'}`}>
        <div className={`text-[10px] uppercase tracking-wide ${textS} mb-1`}>Base fare</div>
        <div className={`text-lg font-bold text-[#1956D6]`}>₹{(flight.displayPrice ?? 0).toLocaleString('en-IN')}</div>
        <div className={`text-[10px] ${textS}`}>{flight.selectedClass} · {flight.passengers ?? 1} pax</div>
      </div>

      <div className="flex items-center gap-1.5">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className={`text-xs font-semibold ${textH}`}>{flight.rating} rated</span>
        <span className={`text-[10px] ${textS}`}>· {flight.seatsLeft} seats left</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOOKING PAGE (main component)
═══════════════════════════════════════════════════════════ */
export default function BookingPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [flight, setFlight] = useState(state?.flight ?? null);
  const [loading, setLoading] = useState(!state?.flight);
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(null); // null | 'processing' | 'error'
  const [errMsg, setErrMsg] = useState('');

  const cabinClass = flight?.selectedClass ?? 'economy';

  // Form state
  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: flight?.passengers ?? 1 }, () => ({ name: '', email: '', phone: '', dob: '', age: '', gender: '' }))
  );
  
  const passengerCount = passengers.length;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [meals, setMeals] = useState({ veg: 0, nonVeg: 0 });

  // Whenever passenger list shrinks, prune overpopulated selected seats.
  useEffect(() => {
    if (selectedSeats.length > passengers.length) {
      setSelectedSeats(prev => prev.slice(0, passengers.length));
    }
  }, [passengers.length, selectedSeats.length]);

  // Seat map
  const [seatMap, setSeatMap] = useState({ business: [], economy: [] });
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatsError, setSeatsError] = useState('');
  const [hasFetchedSeats, setHasFetchedSeats] = useState(false);

  useEffect(() => {
    if (!flight?.id || step < 2) return;
    if (hasFetchedSeats) return; // Prevent infinite re-fetch even if empty
    
    let isMounted = true;
    setLoadingSeats(true);
    setSeatsError('');
    fetchSeatMapAPI(flight.id)
      .then(map => {
        if (isMounted) setSeatMap(map);
      })
      .catch(err => {
        if (isMounted) setSeatsError(err.message);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingSeats(false);
          setHasFetchedSeats(true);
        }
      });
    return () => { isMounted = false; };
  }, [flight?.id, step, hasFetchedSeats]);

  // Auth guard
  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Fetch flight if navigated directly
  useEffect(() => {
    if (state?.flight) return;
    setLoading(true);
    getFlightById(id).then(f => {
      if (!f) { navigate('/dashboard', { replace: true }); return; }
      setFlight({ ...f, displayPrice: f.price?.economy ?? 0, selectedClass: 'economy', passengers: 1 });
    }).finally(() => setLoading(false));
  }, [id]);

  // Sync passenger array when count changes
  useEffect(() => {
    setPassengers(p => {
      const arr = [...p];
      while (arr.length < passengerCount) arr.push({ name: '', email: '', phone: '', dob: '', age: '', gender: '' });
      return arr.slice(0, passengerCount);
    });
  }, [passengerCount]);

  const toggleSeat = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : prev.length < passengerCount ? [...prev, seatId] : prev
    );
  };

  const priceBreakdown = useMemo(() => {
    if (!flight) return { basePrice: 0, seatExtra: 0, mealCost: 0, subtotal: 0, tax: 0, totalPrice: 0 };
    const seatExtra = selectedSeats.reduce((t, id) => t + getSeatExtraPrice(flight.id, id), 0);
    const mealCost = meals.veg * 250 + meals.nonVeg * 350;
    const baseFareTotal = (flight.displayPrice ?? 0) * passengers.length;
    const subtotal = baseFareTotal + seatExtra + mealCost;
    const tax = Math.round(subtotal * 0.12);
    return { basePrice: baseFareTotal, seatExtra, mealCost, subtotal, tax, totalPrice: subtotal + tax };
  }, [flight, selectedSeats, meals, passengers.length]);

  const handlePayment = async () => {
    setSubmitting('processing');
    setErrMsg('');
    try {
      const result = await createBooking({
        flightId: flight.id,
        flightNo: flight.flightNo,
        cabinClass,
        passengerList: passengers,
        selectedSeats,
        meals,
        basePrice: flight.displayPrice ?? 0,
        userId: user?.user_id || user?.id || 'U103',
      });
      setBooking(result);
      setStep(5);
    } catch (err) {
      setErrMsg(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  // ── Styles ──────────────────────────────────────────────
  const bg = isDark ? 'bg-[#060B17]' : 'bg-[#F4F7FF]';
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const navBg = isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]';

  if (!user) return null;

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Nav ── */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
        <div className="container h-16 flex items-center gap-4">
          <button onClick={() => step > 1 && step < 5 ? setStep(s => s - 1) : navigate(-1)}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            <ArrowLeft size={16} /> {step === 1 || step === 5 ? 'Results' : 'Back'}
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-6 h-6 rounded-md bg-[#1956D6] flex items-center justify-center">
              <Plane size={11} className="text-white -rotate-45" />
            </div>
            <span className={`font-bold text-sm ${textH}`}>Sky<span className="text-[#1956D6]">Voyage</span></span>
          </div>
          {step < 5 && (
            <span className={`text-xs ml-auto font-medium ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Booking · <span className="font-bold text-[#1956D6]">{id}</span>
            </span>
          )}
        </div>
      </nav>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <svg className="animate-spin w-10 h-10 text-[#1956D6]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}

      {/* ── Main ── */}
      {!loading && flight && (
        <div className="container py-8">

          {step < 5 && <StepBar step={step} isDark={isDark} />}

          {step === 5 ? (
            <SuccessScreen booking={booking} isDark={isDark} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Form area */}
              <div className="flex-1 min-w-0 anim-fade-up">
                {errMsg && (
                  <div className={`mb-4 rounded-xl p-3 flex items-center gap-2 border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                    <AlertTriangle size={14} />
                    <span className="text-sm">{errMsg}</span>
                  </div>
                )}

                {step === 1 && (
                  <PassengerStep
                    passengers={passengers}
                    count={passengerCount}
                    onChange={setPassengers}
                    onNext={() => setStep(2)}
                    isDark={isDark}
                  />
                )}
                {step === 2 && (
                  loadingSeats ? (
                    <div className="flex flex-col items-center justify-center py-20 anim-fade-up">
                      <svg className="animate-spin w-8 h-8 text-[#1956D6] mb-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Loading seat map...</p>
                    </div>
                  ) : seatsError ? (
                    <div className={`anim-fade-up rounded-2xl p-8 flex flex-col items-center text-center gap-4 border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                      <AlertTriangle size={36} className="text-red-500" />
                      <div>
                        <h3 className="font-bold text-lg mb-1">Seats Unavailable</h3>
                        <p className="text-sm opacity-80">{seatsError}</p>
                      </div>
                      <button onClick={() => setStep(1)} className="btn-primary px-6 py-2.5 rounded-xl mt-2 text-sm">
                        Go Back
                      </button>
                    </div>
                  ) : (
                    <SeatStep
                      seatMap={seatMap}
                      cabinClass={cabinClass}
                      selected={selectedSeats}
                      onToggle={toggleSeat}
                      maxSeats={passengerCount}
                      onNext={() => setStep(3)}
                      onBack={() => setStep(1)}
                      isDark={isDark}
                    />
                  )
                )}
                {step === 3 && (
                  <MealStep
                    meals={meals}
                    onChange={setMeals}
                    totalPassengers={passengerCount}
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                    isDark={isDark}
                  />
                )}
                {step === 4 && (
                  <PaymentStep
                    summary={priceBreakdown}
                    onConfirm={handlePayment}
                    onBack={() => setStep(3)}
                    loading={submitting === 'processing'}
                    isDark={isDark}
                  />
                )}
              </div>

              {/* Sidebar summary */}
              <div className="lg:w-80 shrink-0 w-full anim-fade-up delay-1">
                <FlightSummary
                  flight={flight}
                  selectedSeats={selectedSeats}
                  meals={meals}
                  isDark={isDark}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
