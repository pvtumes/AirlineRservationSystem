import React, { useState, useRef } from 'react';
import { useNavigate }  from 'react-router-dom';
import {
  Plane, ArrowLeft, Search, CheckCircle, XCircle,
  AlertTriangle, Loader2, User, Ticket, MapPin,
  Clock3, Armchair, Utensils, Calendar, Download,
  QrCode, Wifi, ChevronRight, Shield,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { lookupBooking, performCheckin, getCheckinEligibility, validatePnr } from '../services/checkinService';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════
   BOARDING PASS CARD
═══════════════════════════════════════════════════════════ */
function QRPlaceholder() {
  // SVG mock QR code that looks realistic
  const cells = [];
  const size  = 7;
  const pattern = [
    [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1],
  ];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      cells.push(<rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="7" height="7" fill={pattern[r][c] ? '#111' : '#fff'} />);
    }
  }
  // Random inner dots
  for (let i = 0; i < 28; i++) {
    const seed   = (i * 137 + 53) % 1000;
    const row    = (seed % 5) + 1;
    const col    = (seed % 5) + 1;
    cells.push(<rect key={`r${i}`} x={col * 8} y={row * 8} width="6" height="6" fill={seed % 3 === 0 ? '#111' : '#fff'} style={{ opacity: 0.8 }} />);
  }
  return <svg width="56" height="56" viewBox="0 0 56 56" className="rounded-lg overflow-hidden border p-1 bg-white">{cells}</svg>;
}

function Barcode() {
  const bars = Array.from({ length: 40 }, (_, i) => {
    const w = ((i * 97 + 7) % 3) + 1;
    return <rect key={i} x={i * 4} y={0} width={w} height="40" fill="#111" opacity={0.8 + Math.sin(i) * 0.15} />;
  });
  return (
    <svg width="160" height="40" viewBox="0 0 160 40" className="rounded overflow-hidden bg-white p-1">
      {bars}
    </svg>
  );
}

function BoardingPass({ pass, isDark }) {
  const bg   = '#0F1A2E';
  return (
    <div className="w-full max-w-2xl mx-auto select-none" id="boarding-pass">
      {/* Main card */}
      <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#1956D6]/20 bg-white flex flex-col sm:flex-row">

        {/* Left / top stripe — airline color */}
        <div className="sm:w-8 h-3 sm:h-auto shrink-0" style={{ background: `linear-gradient(135deg, #1956D6, #3B82F6)` }} />

        {/* Main body */}
        <div className="flex-1 flex flex-col sm:flex-row">
          {/* Left panel */}
          <div className="flex-1 p-6 bg-[#060B17] text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1956D6] flex items-center justify-center">
                  <Plane size={14} className="text-white -rotate-45" />
                </div>
                <span className="font-black text-sm tracking-widest text-white/80">SKYVOYAGE</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 bg-white/[0.06] px-2 py-1 rounded-full">BOARDING PASS</span>
            </div>

            {/* Route — the hero */}
            <div className="flex items-center gap-3 mb-6">
              <div>
                <div className="text-5xl font-black tracking-tight text-white">{pass.fromCode}</div>
                <div className="text-xs font-medium text-white/50 mt-0.5">{pass.from}</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{pass.stops === 0 ? 'NONSTOP' : '1 STOP'}</div>
                <div className="relative w-full flex items-center">
                  <div className="flex-1 h-px bg-white/20" />
                  <Plane size={16} className="text-[#3B82F6] mx-1 -rotate-45 drop-shadow-lg" />
                  <div className="flex-1 h-px bg-white/20" />
                </div>
                <div className="text-white/30 text-[9px] font-bold">{pass.durationLabel}</div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black tracking-tight text-white">{pass.toCode}</div>
                <div className="text-xs font-medium text-white/50 mt-0.5">{pass.to}</div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'PASSENGER',    value: pass.passengerName.toUpperCase() },
                { label: 'FLIGHT',       value: pass.flightNo },
                { label: 'CLASS',        value: pass.cabinClass.toUpperCase() },
                { label: 'DATE',         value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'DEPARTURE',    value: pass.departureTime },
                { label: 'BOARDING',     value: pass.boardingTime },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[9px] font-bold text-white/35 tracking-widest mb-0.5">{label}</div>
                  <div className="text-xs font-bold text-white leading-tight truncate">{value}</div>
                </div>
              ))}
            </div>

            {/* Booking ref */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] text-white/35 font-bold tracking-widest">BOOKING REF</div>
                <div className="text-sm font-black tracking-widest text-[#3B82F6]">{pass.bookingRef}</div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle size={10} /> CHECKED IN
              </div>
            </div>
          </div>

          {/* Tear line (dashes) */}
          <div className="hidden sm:flex flex-col items-center justify-center w-6 relative bg-[#060B17]">
            <div className="absolute inset-y-4 left-1/2 border-l-2 border-dashed border-white/10" />
            <div className="absolute top-0 w-5 h-5 rounded-full bg-[#060B17] -translate-x-1/2 left-0 -translate-y-1/2 border-r border-white/[0.06]" />
            <div className="absolute bottom-0 w-5 h-5 rounded-full bg-[#060B17] -translate-x-1/2 left-0 translate-y-1/2 border-r border-white/[0.06]" />
          </div>

          {/* Right stub */}
          <div className="sm:w-44 p-5 bg-[#0A1428] border-t sm:border-t-0 sm:border-l border-white/[0.06] flex flex-col items-center gap-4">
            {/* Seat — hero element */}
            <div className="text-center">
              <div className="text-[9px] font-bold text-white/35 tracking-widest mb-1">SEAT</div>
              <div className="text-4xl font-black text-white tracking-wide">{pass.seat}</div>
              <div className="text-[9px] text-white/40 mt-0.5">
                {pass.seat.slice(-1) === 'A' || pass.seat.slice(-1) === 'F' ? 'Window' :
                 pass.seat.slice(-1) === 'C' || pass.seat.slice(-1) === 'D' ? 'Aisle' : 'Middle'}
              </div>
            </div>

            <div className="w-full h-px bg-white/[0.07]" />

            <div className="text-center">
              <div className="text-[9px] font-bold text-white/35 tracking-widest mb-1">GATE</div>
              <div className="text-2xl font-black text-[#3B82F6]">{pass.gate}</div>
            </div>

            <div className="text-center">
              <div className="text-[9px] font-bold text-white/35 tracking-widest mb-1">TERMINAL</div>
              <div className="text-lg font-black text-white">{pass.terminal}</div>
            </div>

            <div className="w-full h-px bg-white/[0.07]" />

            {/* QR */}
            <QRPlaceholder />

            {/* Barcode */}
            <Barcode />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOOKING PREVIEW (before check-in confirmation)
═══════════════════════════════════════════════════════════ */
function BookingPreview({ booking, flight, eligibility, onConfirm, confirming, isDark }) {
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  const passengers = booking.passengers ?? [];
  const canCheck   = eligibility.canCheckin;

  return (
    <div className={`border rounded-2xl overflow-hidden ${card} max-w-lg mx-auto`}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow" style={{ background: '#1956D6' }}>
            <Ticket size={18} />
          </div>
          <div>
            <p className={`font-bold ${textH}`}>{booking.bookingRef}</p>
            <p className={`text-xs ${textS}`}>{booking.flightNo} · {booking.cabinClass} class</p>
          </div>
          <div className="ml-auto">
            {booking.status === 'cancelled'
              ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Cancelled</span>
              : booking.checkinStatus === 'checked-in'
                ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1"><CheckCircle size={11}/> Checked In</span>
                : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#1956D6] border border-[#1956D6]/20">Confirmed</span>
            }
          </div>
        </div>
      </div>

      {/* Flight info */}
      {flight && (
        <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <div className="text-center">
            <div className={`text-2xl font-black ${textH}`}>{flight.departureTime}</div>
            <div className="text-xs font-bold text-[#1956D6]">{flight.fromCode}</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className={`text-[10px] ${textS}`}>{flight.durationLabel}</div>
            <div className="relative w-full flex items-center">
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <Plane size={13} className="text-[#1956D6] mx-1 -rotate-45" />
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>
            <div className={`text-[10px] font-semibold ${flight.stops === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-black ${textH}`}>{flight.arrivalTime}</div>
            <div className="text-xs font-bold text-[#1956D6]">{flight.toCode}</div>
          </div>
        </div>
      )}

      {/* Passengers */}
      <div className="px-6 py-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textS}`}>Passengers</p>
        {passengers.map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <div className="w-6 h-6 rounded-full bg-[#1956D6]/10 text-[#1956D6] text-[10px] font-bold flex items-center justify-center">{i+1}</div>
            <span className={`text-sm font-semibold ${textH}`}>{p.name}</span>
            {booking.seats?.[i] && <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/[0.06] text-white/60' : 'bg-slate-100 text-slate-600'}`}>{booking.seats[i]}</span>}
          </div>
        ))}
      </div>

      {/* Eligibility message */}
      {!canCheck && (
        <div className={`mx-6 my-4 rounded-xl px-4 py-3 flex items-start gap-2.5 ${eligibility.alreadyDone ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          {eligibility.alreadyDone ? <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />}
          <p className={`text-sm ${eligibility.alreadyDone ? 'text-emerald-500' : 'text-amber-500'}`}>{eligibility.reason}</p>
        </div>
      )}

      {/* Action */}
      <div className="px-6 pb-5 pt-4">
        {canCheck ? (
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="w-full btn-primary py-3.5 rounded-xl gap-3 disabled:opacity-50"
          >
            {confirming ? <><Loader2 size={16} className="animate-spin" /> Processing check-in…</> : <><CheckCircle size={16} /> Confirm Web Check-in</>}
          </button>
        ) : eligibility.alreadyDone ? (
          <button onClick={onConfirm} disabled={confirming} className="w-full btn-primary py-3.5 rounded-xl gap-2 disabled:opacity-50">
            {confirming ? <Loader2 size={16} className="animate-spin"/> : <Ticket size={16}/>} View Boarding Pass
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHECK-IN PAGE (main)
═══════════════════════════════════════════════════════════ */
export default function CheckinPage() {
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const { user }   = useAuth();

  const [pnr,        setPnr]        = useState('');
  const [phase,      setPhase]      = useState('enter'); // enter | loading | preview | checkin-loading | done | error
  const [errorMsg,   setErrorMsg]   = useState('');
  const [booking,    setBooking]    = useState(null);
  const [flight,     setFlight]     = useState(null);
  const [eligibility,setEligibility]= useState(null);
  const [boardingPass,setBoardingPass]= useState(null);

  const bg    = isDark ? 'bg-[#060B17]'  : 'bg-[#F4F7FF]';
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const navBg = isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]';

  const handleLookup = async (e) => {
    e?.preventDefault();
    const trimmedPnr = pnr.trim();

    // Client-side validation before API hit
    const { valid, error: validErr } = validatePnr(trimmedPnr);
    if (!valid) {
      setErrorMsg(validErr);
      setPhase('error');
      return;
    }

    setPhase('loading');
    setErrorMsg('');
    try {
      const { booking: b, flight: f } = await lookupBooking(trimmedPnr);
      const elig = getCheckinEligibility(b);
      setBooking(b);
      setFlight(f);
      setEligibility(elig);
      setPhase('preview');
    } catch (err) {
      setErrorMsg(err.message);
      setPhase('error');
    }
  };

  const handleCheckin = async () => {
    setPhase('checkin-loading');
    try {
      // Pass full context so the service can handle already-checked-in case
      const { boardingPass: bp } = await performCheckin(
        booking.bookingRef,
        { booking, flight },
        { seat: null },
      );
      setBoardingPass(bp);
      setPhase('done');
      toast.success('Check-in successful! 🎉');
    } catch (err) {
      toast.error(err.message || 'Check-in failed.');
      setPhase('preview');
    }
  };

  const reset = () => { setPnr(''); setPhase('enter'); setErrorMsg(''); setBooking(null); setFlight(null); setBoardingPass(null); };

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Nav */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
        <div className="container h-16 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            <ArrowLeft size={16}/> Dashboard
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-6 h-6 rounded-md bg-[#1956D6] flex items-center justify-center"><Plane size={11} className="text-white -rotate-45"/></div>
            <span className={`font-bold text-sm ${textH}`}>Web Check-in</span>
          </div>
        </div>
      </nav>

      <div className="container py-10 max-w-2xl">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1956D6] to-[#3B82F6] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#1956D6]/30">
            <Ticket size={28} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${textH}`}>Online Check-in</h1>
          <p className={`text-sm mt-1 ${textS}`}>Enter your PNR to check in and receive your boarding pass</p>
        </div>

        {/* ── PHASE: Enter PNR ── */}
        {(phase === 'enter' || phase === 'error') && (
          <form onSubmit={handleLookup} className={`border rounded-2xl p-6 space-y-4 ${card}`}>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textS}`}>Booking Reference (PNR)</label>
              <div className="relative">
                <input
                  id="checkin-pnr"
                  value={pnr}
                  onChange={e => setPnr(e.target.value.toUpperCase())}
                  placeholder="e.g. B001 or SV-A3F9K2"
                  maxLength={20}
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl border outline-none text-sm font-mono tracking-widest transition-all focus:border-[#1956D6]/60 focus:ring-2 focus:ring-[#1956D6]/10 ${isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/20' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                />
                <Search size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 ${textS}`} />
              </div>
            </div>

            {phase === 'error' && (
              <div className="rounded-xl px-4 py-3 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20">
                <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* Tips */}
            <div className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
              <p className={`text-[11px] font-semibold ${textS} mb-1.5`}>💡 Where to find your PNR?</p>
              <ul className={`text-[11px] ${textS} space-y-0.5 list-disc list-inside`}>
                <li>Your booking confirmation email</li>
                <li>Under <strong>My Bookings</strong> → expand any booking card</li>
                <li>Format: SV-XXXXXX (6 characters after the dash)</li>
              </ul>
            </div>

            <button type="submit" className="w-full btn-primary py-3.5 rounded-xl gap-2">
              <Search size={16}/> Find My Booking
            </button>

            <button type="button" onClick={() => navigate('/my-bookings')} className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition-all ${isDark ? 'border-white/10 text-white/50 hover:border-[#1956D6]/30 hover:text-[#1956D6]' : 'border-slate-200 text-slate-600 hover:border-[#1956D6]/30 hover:text-[#1956D6]'}`}>
              View My Bookings <ChevronRight size={14} className="inline ml-1"/>
            </button>
          </form>
        )}

        {/* ── PHASE: Loading ── */}
        {phase === 'loading' && (
          <div className={`border rounded-2xl p-16 flex flex-col items-center gap-4 ${card}`}>
            <Loader2 size={36} className="text-[#1956D6] animate-spin" />
            <p className={`text-sm font-medium ${textS}`}>Looking up booking <span className="font-mono font-bold text-[#1956D6]">{pnr}</span>…</p>
          </div>
        )}

        {/* ── PHASE: Preview + Confirm ── */}
        {(phase === 'preview' || phase === 'checkin-loading') && booking && (
          <div className="space-y-4">
            <BookingPreview
              booking={booking}
              flight={flight}
              eligibility={eligibility}
              onConfirm={handleCheckin}
              confirming={phase === 'checkin-loading'}
              isDark={isDark}
            />
            <button onClick={reset} className={`w-full py-2.5 rounded-xl border text-sm font-medium ${isDark ? 'border-white/10 text-white/40 hover:border-white/20' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
              ← Search different booking
            </button>
          </div>
        )}

        {/* ── PHASE: Done — Boarding Pass ── */}
        {phase === 'done' && boardingPass && (
          <div className="space-y-6">
            {/* Success banner */}
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-500">Check-in Successful!</p>
                <p className={`text-xs ${textS}`}>Your boarding pass is ready. Please arrive at the gate 30 min before boarding.</p>
              </div>
            </div>

            {/* Boarding pass */}
            <BoardingPass pass={boardingPass} isDark={isDark} />

            {/* Security reminder */}
            <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'}`}>
              <Shield size={16} className="text-[#1956D6] shrink-0 mt-0.5" />
              <p className={`text-xs ${textS}`}>
                Present this boarding pass (digital or printed) along with a valid government-issued photo ID at the security checkpoint and boarding gate.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${isDark ? 'border-white/10 text-white/60 hover:border-white/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                Check-in Another
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex-1 btn-primary py-3 rounded-xl gap-2 text-sm">
                <Plane size={14} className="-rotate-45"/> Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
