import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlaneTakeoff, PlaneLanding, Calendar, Users, ChevronDown,
  ArrowLeftRight, Search, Tag,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CITIES } from '../data/flights.js';

/* ── City autocomplete field ───────────────────────────── */
function CityInput({ label, icon: Icon, value, onChange, placeholder, id }) {
  const { isDark } = useTheme();
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState(value);
  const ref                   = useRef(null);

  // sync external value → query
  useEffect(() => { setQuery(value); }, [value]);

  // click outside → close
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const matches = query.length > 0
    ? CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : CITIES.slice(0, 6);

  const select = city => {
    const val = city.name;
    setQuery(val);
    onChange(val);
    setOpen(false);
  };

  const fieldBg  = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-black/10';
  const dropBg   = isDark ? 'bg-[#0F1929] border-white/10'   : 'bg-white border-black/10';
  const hoverRow = isDark ? 'hover:bg-white/[0.06]'           : 'hover:bg-[#F4F7FF]';
  const textSub  = isDark ? 'text-white/40'                   : 'text-slate-400';

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <label htmlFor={id} className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
        {label}
      </label>
      <div className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border transition-all duration-200 ${fieldBg} focus-within:border-[#1956D6]/60 focus-within:ring-2 focus-within:ring-[#1956D6]/10`}>
        <Icon size={16} className="text-[#1956D6] shrink-0" />
        <input
          id={id}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className={`flex-1 bg-transparent outline-none text-sm font-medium ${isDark ? 'text-white placeholder-white/25' : 'text-slate-800 placeholder-slate-400'}`}
        />
      </div>

      {open && (
        <div className={`absolute top-full mt-2 left-0 right-0 rounded-xl border shadow-xl z-50 overflow-hidden ${dropBg}`}>
          {matches.map(city => (
            <button
              key={city.code}
              type="button"
              onClick={() => select(city)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${hoverRow}`}
            >
              <div>
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{city.name}</div>
                <div className={`text-xs ${textSub}`}>{city.country}</div>
              </div>
              <span className="text-xs font-bold text-[#1956D6] bg-[#1956D6]/10 px-2 py-0.5 rounded-md">{city.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────── */
export default function FlightSearchForm({ compact = false }) {
  const { isDark }   = useTheme();
  const navigate     = useNavigate();

  const [tripType,    setTripType]    = useState('one-way');
  const [from,        setFrom]        = useState('');
  const [to,          setTo]          = useState('');
  const [date,        setDate]        = useState('');
  const [returnDate,  setReturnDate]  = useState('');
  const [passengers,  setPassengers]  = useState(1);
  const [tripClass,   setTripClass]   = useState('economy');
  const [classOpen,   setClassOpen]   = useState(false);
  const [sameCityErr, setSameCityErr] = useState(false);
  const classRef = useRef(null);

  // close class dropdown on outside click
  useEffect(() => {
    const h = e => { if (classRef.current && !classRef.current.contains(e.target)) setClassOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const swapCities = () => { setFrom(to); setTo(from); setSameCityErr(false); };

  const handleFromChange = val => { setFrom(val); setSameCityErr(false); };
  const handleToChange   = val => { setTo(val);   setSameCityErr(false); };

  const onSubmit = e => {
    e.preventDefault();
    if (from.trim().toLowerCase() === to.trim().toLowerCase() && from.trim() !== '') {
      setSameCityErr(true);
      return;
    }
    setSameCityErr(false);
    navigate('/results', {
      state: { from, to, date, returnDate, passengers, tripClass, tripType },
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const surface = isDark
    ? 'bg-[#0B1324]/90 border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
    : 'bg-white/95 border-black/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.10)]';

  const fieldBg  = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-black/10';
  const textMain = isDark ? 'text-white' : 'text-slate-800';
  const textSub  = isDark ? 'text-white/50' : 'text-slate-500';
  const labelCls = `block text-xs font-semibold mb-1.5 uppercase tracking-wide ${textSub}`;

  const CLASS_OPTIONS = [
    { value: 'economy',  label: 'Economy',  desc: 'Best value' },
    { value: 'business', label: 'Business', desc: 'Premium comfort' },
    { value: 'first',    label: 'First',    desc: 'Ultimate luxury' },
  ];

  return (
    <div className={`rounded-2xl border backdrop-blur-xl p-6 ${surface} ${compact ? '' : 'lg:p-8'}`}>

      {/* Trip type tabs */}
      <div className="flex items-center gap-1 mb-6 bg-black/5 dark:bg-white/5 p-1 rounded-xl w-fit">
        {['one-way', 'round-trip'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
              tripType === t
                ? 'bg-[#1956D6] text-white shadow-md shadow-[#1956D6]/30'
                : `${textSub} hover:${textMain}`
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">

        {/* Row 1: Origin ↔ Destination */}
        <div className="flex items-end gap-3">
          <CityInput
            id="from-city"
            label="From"
            icon={PlaneTakeoff}
            value={from}
            onChange={handleFromChange}
            placeholder="Origin city or code"
          />

          {/* Swap button */}
          <button
            type="button"
            onClick={swapCities}
            className="mb-0.5 w-10 h-10 shrink-0 self-end rounded-full border border-[#1956D6]/30 bg-[#1956D6]/10 text-[#1956D6] flex items-center justify-center hover:bg-[#1956D6] hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-180"
            title="Swap cities"
          >
            <ArrowLeftRight size={15} />
          </button>

          <CityInput
            id="to-city"
            label="To"
            icon={PlaneLanding}
            value={to}
            onChange={handleToChange}
            placeholder="Destination city or code"
          />
        </div>

        {/* Same-city error */}
        {sameCityErr && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium animate-pulse">
            <span>⚠️</span>
            <span>Origin and destination cannot be the same. Please choose different cities.</span>
          </div>
        )}

        {/* Row 2: Date(s) + Passengers + Class */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Departure date */}
          <div className="col-span-1">
            <label htmlFor="dep-date" className={labelCls}>Departure</label>
            <div className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border transition-all duration-200 ${fieldBg} focus-within:border-[#1956D6]/60 focus-within:ring-2 focus-within:ring-[#1956D6]/10`}>
              <Calendar size={16} className="text-[#1956D6] shrink-0" />
              <input
                id="dep-date"
                type="date"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className={`flex-1 bg-transparent outline-none text-sm font-medium ${textMain} [color-scheme:${isDark?'dark':'light'}]`}
              />
            </div>
          </div>

          
         
          {/* Class picker */}
          <div className="col-span-1 relative" ref={classRef}>
            <label className={labelCls}>Class</label>
            <button
              type="button"
              onClick={() => setClassOpen(o => !o)}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl border transition-all duration-200 ${fieldBg} ${classOpen ? 'border-[#1956D6]/60 ring-2 ring-[#1956D6]/10' : ''}`}
            >
              <Tag size={16} className="text-[#1956D6] shrink-0" />
              <span className={`flex-1 text-left text-sm font-medium capitalize ${textMain}`}>{tripClass}</span>
              <ChevronDown size={14} className={`text-[#1956D6] transition-transform duration-200 ${classOpen ? 'rotate-180' : ''}`} />
            </button>

            {classOpen && (
              <div className={`absolute top-full mt-2 left-0 right-0 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-[#0F1929] border-white/10' : 'bg-white border-black/10'}`}>
                {CLASS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setTripClass(opt.value); setClassOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-[#F4F7FF]'} ${tripClass === opt.value ? 'text-[#1956D6]' : ''}`}
                  >
                    <div>
                      <div className={`text-sm font-semibold ${tripClass === opt.value ? 'text-[#1956D6]' : textMain}`}>{opt.label}</div>
                      <div className={`text-xs ${textSub}`}>{opt.desc}</div>
                    </div>
                    {tripClass === opt.value && <div className="w-2 h-2 rounded-full bg-[#1956D6]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="btn-primary w-full py-4 text-base rounded-xl gap-2.5 mt-2"
        >
          <Search size={18} />
          Search Flights
        </button>
      </form>
    </div>
  );
}
