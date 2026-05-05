import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, ArrowLeftRight, Search, ArrowRight, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune',
  'Hyderabad', 'Kochi', 'Ahmedabad', 'Jaipur',
  'Dubai', 'Singapore', 'London', 'New York', 'Tokyo', 'Paris', 'Bali',
];


function CustomDropdown({ value, onChange, options, placeholder, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative flex-1 w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center bg-transparent outline-none text-[15px] font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}
      >
        <span>{value || <span className={isDark ? 'text-white/40' : 'text-gray-400'}>{placeholder}</span>}</span>
        <ChevronDown size={15} strokeWidth={2.5} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
      </button>

      {open && (
        <div className={`absolute left-0 top-[calc(100%+16px)] w-full min-w-[220px] z-[60] rounded-xl border shadow-2xl py-2 max-h-[280px] overflow-y-auto transform origin-top transition-all anim-fade-in ${isDark ? 'bg-[#0F1929] border-white/10 shadow-black/80' : 'bg-white border-black/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.12)]'
          }`}>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${value === opt
                ? (isDark ? 'bg-[#1956D6]/20 text-[#1956D6] font-semibold tracking-wide' : 'bg-[#1956D6]/10 text-[#1956D6] font-semibold tracking-wide')
                : (isDark ? 'text-white/70 hover:bg-white/[0.06] hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDatePicker({ value, onChange, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    days.push(
      <div key="header" className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(wd => (
          <div key={wd} className={`text-center text-[11px] font-semibold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{wd}</div>
        ))}
      </div>
    );

    const grid = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
      const isPast = d < today;

      let dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isSelected = value === dateString;

      grid.push(
        <button
          key={i}
          disabled={isPast}
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(dateString); setOpen(false); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-all
            ${isPast ? (isDark ? 'text-white/20 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
              : isSelected
                ? 'bg-[#1956D6] text-white shadow-md shadow-[#1956D6]/30 font-semibold'
                : (isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100')
            }
          `}
        >
          {i}
        </button>
      );
    }

    days.push(<div key="grid" className="grid grid-cols-7 gap-1">{grid}</div>);
    return days;
  };

  let displayValue = "Select Date";
  if (value) {
    const d = new Date(value);
    displayValue = `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div className="relative flex-1 w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center bg-transparent outline-none text-[15px] font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}
      >
        <span>{value ? displayValue : <span className={isDark ? 'text-white/40' : 'text-gray-400'}>{displayValue}</span>}</span>
      </button>

      {open && (
        <div className={`absolute left-0 top-[calc(100%+16px)] min-w-[280px] z-[60] rounded-xl border shadow-2xl p-4 transform origin-top transition-all anim-fade-in ${isDark ? 'bg-[#0F1929] border-white/10 shadow-black/80' : 'bg-white border-black/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.12)]'
          }`}>

          <div className="flex justify-between items-center mb-4 px-1">
            <button type="button" onClick={handlePrevMonth} className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ChevronDown size={16} className="rotate-90" />
            </button>
            <div className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button type="button" onClick={handleNextMonth} className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ChevronDown size={16} className="-rotate-90" />
            </button>
          </div>

          {renderDays()}
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [trip, setTrip] = useState('One Way');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [pax, setPax] = useState('1 Adult');

  const swap = () => { setFrom(to); setTo(from); };

  const handleSearch = () => {
    if (!from || !to) return; // Prevent empty searches
    requireAuth(() => {
      navigate('/results', {
        state: {
          from, to, date: date || new Date().toISOString().split('T')[0],
          passengers: parseInt(pax.split(' ')[0]) || 1,
          tripClass: 'economy',
          tripType: trip.toLowerCase().replace(' ', '-')
        }
      });
    }, 'signin');
  };

  return (
    <section id="home" className="relative min-h-screen flex flex-col">

      {/* ── Background ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&auto=format&fit=crop&q=85"
          alt="Premium aircraft above clouds"
          className="w-full h-full object-cover"
        />
        {/* Overlay — dark at bottom, transparent at top */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(6,11,23,0.55) 0%, rgba(6,11,23,0.72) 50%, rgba(6,11,23,0.96) 100%)' }}
        />
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 pt-32 pb-16 px-6 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs font-medium uppercase tracking-widest mb-8 anim-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8963A] inline-block"></span>
          India's #1 Premium Airline
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl anim-fade-up delay-1">
          The World Is<br />
          <em className="not-italic" style={{
            background: 'linear-gradient(135deg, #C8963A 0%, #E8B84B 60%, #C8963A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Yours to Explore</em>
        </h1>

        <p className="mt-6 text-lg text-white/60 max-w-xl leading-relaxed anim-fade-up delay-2">
          Discover 200+ destinations, AI‑powered recommendations,
          and seamless booking — all from one place.
        </p>

        {/* ── Search Card ──────────────────────────────────── */}
        <div id="search" className="w-full max-w-4xl mt-12 anim-fade-up delay-3">
          <div className="rounded-2xl shadow-2xl shadow-black/40"
            style={{ background: isDark ? 'rgba(15,25,41,0.92)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)' }}>

            {/* Fields */}
            <div className="p-6 flex flex-col lg:flex-row items-center gap-4">

              {/* From */}
              <div className="w-full lg:flex-1 relative z-50">
                <label className={`block text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>From</label>
                <div className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-colors duration-200 ${isDark ? 'border-white/10 bg-white/[0.04] focus-within:border-[#1956D6]/60 hover:border-white/20' : 'border-black/[0.08] bg-white focus-within:border-[#1956D6]/60 hover:border-black/[0.15]'
                  } focus-within:ring-2 focus-within:ring-[#1956D6]/15`}>
                  <MapPin size={17} className="text-[#1956D6] shrink-0" />
                  <CustomDropdown value={from} onChange={setFrom} options={CITIES} placeholder="Select city" isDark={isDark} />
                </div>
              </div>

              {/* Swap */}
              <div className="hidden lg:flex items-center justify-center pt-6 shrink-0 relative z-30">
                <button onClick={swap}
                  className="w-9 h-9 rounded-full bg-[#1956D6]/10 border border-[#1956D6]/20 text-[#1956D6] flex items-center justify-center hover:bg-[#1956D6] hover:text-white transition-all duration-200">
                  <ArrowLeftRight size={14} />
                </button>
              </div>

              {/* To */}
              <div className="w-full lg:flex-1 relative z-40">
                <label className={`block text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>To</label>
                <div className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-colors duration-200 ${isDark ? 'border-white/10 bg-white/[0.04] focus-within:border-[#1956D6]/60 hover:border-white/20' : 'border-black/[0.08] bg-white focus-within:border-[#1956D6]/60 hover:border-black/[0.15]'
                  } focus-within:ring-2 focus-within:ring-[#1956D6]/15`}>
                  <MapPin size={17} className="text-[#1956D6] shrink-0" />
                  <CustomDropdown value={to} onChange={setTo} options={CITIES} placeholder="Select city" isDark={isDark} />
                </div>
              </div>

              {/* Date */}
              <div className="w-full lg:flex-1 relative z-20">
                <label className={`block text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Date</label>
                <div className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-colors duration-200 ${isDark ? 'border-white/10 bg-white/[0.04] focus-within:border-[#1956D6]/60 hover:border-white/20' : 'border-black/[0.08] bg-white focus-within:border-[#1956D6]/60 hover:border-black/[0.15]'
                  } focus-within:ring-2 focus-within:ring-[#1956D6]/15`}>
                  <Calendar size={17} className="text-[#1956D6] shrink-0" />
                  <CustomDatePicker value={date} onChange={setDate} isDark={isDark} />
                </div>
              </div>

              {/* Search Btn */}
              <div className="w-full lg:w-auto pt-0 lg:pt-6 relative z-10">
                <button onClick={handleSearch} className="btn-primary w-full lg:w-[160px] h-[52px] rounded-xl text-[15px] gap-2">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>

            {/* Popular routes */}
            <div className={`px-6 pb-4 flex flex-wrap items-center gap-2 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-black/[0.04]'} pt-3`}>
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Popular:</span>
              {['Mumbai → Dubai', 'Delhi → Singapore', 'BLR → London', 'Pune → Tokyo'].map(r => (
                <button
                  key={r}
                  onClick={() => {
                    const [f, t] = r.split(' → ');
                    setFrom(f === 'BLR' ? 'Bangalore' : f);
                    setTo(t);
                  }}
                  className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${isDark ? 'border-white/10 text-white/50 hover:border-[#1956D6]/40 hover:text-white/80' : 'border-black/[0.08] text-gray-500 hover:border-[#1956D6]/40 hover:text-[#1956D6]'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Trip type tabs moved to bottom */}
            <div className={`flex gap-8 border-t ${isDark ? 'border-white/[0.07]' : 'border-black/[0.06]'} px-6 py-4`}>
              {TRIP.map(t => (
                <button
                  key={t}
                  onClick={() => setTrip(t)}
                  className={`text-sm font-semibold transition-all duration-200 ${trip === t
                    ? 'text-[#1956D6]'
                    : `${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-10 mt-14 anim-fade-up delay-4">
          {[
            { n: '200+', l: 'Destinations' },
            { n: '50M+', l: 'Passengers' },
            { n: '98%', l: 'On-Time' },
            { n: '24/7', l: 'Support' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-bold text-white">{s.n}</div>
              <div className="text-xs text-white/45 mt-0.5 uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-widest">
          <span>Scroll</span>
          <div className="w-px h-8 bg-white/20 rounded-full" />
        </div>
      </div>
    </section>
  );
}
