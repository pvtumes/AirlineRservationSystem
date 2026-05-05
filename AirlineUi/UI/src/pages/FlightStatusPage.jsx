import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, ArrowLeft, Search, RefreshCw, Clock3, MapPin,
  Loader2, CheckCircle, AlertTriangle, XCircle, ChevronRight,
  Radio, Navigation, Calendar,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getFlightStatusByNo, getFlightStatusById, getAllFlightStatuses } from '../services/flightStatusService';
import toast from 'react-hot-toast';

/* ── Status config ────────────────────────────────────────── */
const STATUS_CONFIG = {
  'scheduled':     { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    dot: 'bg-blue-500',    label: 'Scheduled'    },
  'on-time':       { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', dot: 'bg-emerald-500', label: 'On Time'      },
  'delayed':       { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-500',   dot: 'bg-amber-500',   label: 'Delayed'      },
  'boarding-soon': { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  dot: 'bg-violet-500',  label: 'Boarding Soon'},
  'boarding':      { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  dot: 'bg-indigo-500',  label: 'Boarding'     },
  'departed':      { bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   text: 'text-slate-400',   dot: 'bg-slate-400',   label: 'Departed'     },
  'landed':        { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', dot: 'bg-emerald-500', label: 'Landed'       },
};

function StatusBadge({ statusKey, label, large }) {
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['scheduled'];
  const isLive = ['boarding-soon','boarding'].includes(statusKey);
  return (
    <span className={`inline-flex items-center gap-2 border rounded-full font-bold ${cfg.bg} ${cfg.border} ${cfg.text} ${large ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1'}`}>
      <span className={`rounded-full shrink-0 ${cfg.dot} ${large ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'} ${isLive ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

/* ── Flight status card ───────────────────────────────────── */
function FlightStatusCard({ flight, status, isDark, compact }) {
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  return (
    <div className={`border rounded-2xl overflow-hidden ${card} ${compact ? '' : 'shadow-xl shadow-black/10'}`}>
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #1956D6, #3B82F6)` }} />

      <div className="p-5">
        {/* Row 1: Airline + status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow shrink-0" style={{ background: flight.airline?.color ?? '#1956D6' }}>
              {flight.airlineCode}
            </div>
            <div>
              <div className={`font-bold text-sm ${textH}`}>{flight.airline?.name}</div>
              <div className={`text-xs ${textS}`}>{flight.flightNo} · {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</div>
            </div>
          </div>
          <StatusBadge statusKey={status.statusKey} label={status.label} large={!compact} />
        </div>

        {/* Row 2: Route */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-black ${textH} tabular-nums`}>{status.effectiveDep}</div>
            <div className={`text-xs font-bold text-[#1956D6]`}>{flight.fromCode}</div>
            <div className={`text-[10px] mt-0.5 ${textS}`}>{flight.from}</div>
            {status.delayed && (
              <div className="text-[10px] text-amber-500 font-semibold mt-0.5 line-through opacity-60">{status.scheduledDep}</div>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className={`text-[10px] ${textS}`}>{flight.durationLabel}</div>
            {/* Progress bar */}
            <div className={`relative w-full h-1.5 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#1956D6] to-[#3B82F6] transition-all duration-1000"
                style={{ width: `${status.progressPct}%` }}
              />
              {status.progressPct > 0 && status.progressPct < 100 && (
                <Plane
                  size={12}
                  className="absolute top-1/2 -translate-y-1/2 text-[#3B82F6] -rotate-45 drop-shadow"
                  style={{ left: `clamp(0%, calc(${status.progressPct}% - 6px), calc(100% - 12px))` }}
                />
              )}
            </div>
            <div className={`text-[10px] font-semibold ${flight.stops === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-black ${textH} tabular-nums`}>{status.effectiveArr}</div>
            <div className={`text-xs font-bold text-[#1956D6]`}>{flight.toCode}</div>
            <div className={`text-[10px] mt-0.5 ${textS}`}>{flight.to}</div>
            {status.delayed && (
              <div className="text-[10px] text-amber-500 font-semibold mt-0.5 line-through opacity-60">{status.scheduledArr}</div>
            )}
          </div>
        </div>

        {/* Row 3: Gate / Terminal / Description */}
        <div className={`rounded-xl p-3 flex flex-wrap gap-4 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
          <div>
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${textS}`}>Gate</div>
            <div className={`text-lg font-black text-[#1956D6]`}>{status.gate}</div>
          </div>
          <div>
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${textS}`}>Terminal</div>
            <div className={`text-lg font-black ${textH}`}>{status.terminal}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${textS}`}>Status Info</div>
            <div className={`text-xs font-medium ${textS} leading-relaxed`}>{status.description}</div>
          </div>
        </div>

        {/* Delay banner */}
        {status.delayed && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-amber-500">
              Flight delayed by {status.delayMin} minutes. We apologise for the inconvenience.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── All flights list ───────────────────────────────────── */
function AllFlightsList({ isDark }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllFlightStatuses();
      setItems(all);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 size={28} className="text-[#1956D6] animate-spin" /></div>;

  const grouped = {};
  items.forEach(({ flight, status }) => {
    const key = `${flight.from} → ${flight.to}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ flight, status });
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).slice(0, 5).map(([route, flights]) => (
        <div key={route}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-white/[0.04] text-white/40' : 'bg-slate-100 text-slate-500'}`}>{route}</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
          </div>
          <div className="space-y-3">
            {flights.map(({ flight, status }) => (
              <FlightStatusCard key={flight.id} flight={flight} status={status} isDark={isDark} compact />
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-center">
        <button onClick={load} className="flex items-center gap-2 text-sm font-semibold text-[#1956D6] hover:underline">
          <RefreshCw size={13}/> Refresh statuses
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLIGHT STATUS PAGE (main)
═══════════════════════════════════════════════════════════ */
export default function FlightStatusPage() {
  const navigate   = useNavigate();
  const { isDark } = useTheme();

  const [query,   setQuery]   = useState('');
  const [date,    setDate]    = useState(new Date().toISOString().slice(0,10));
  const [phase,   setPhase]   = useState('idle'); // idle | loading | result | error
  const [result,  setResult]  = useState(null);
  const [errMsg,  setErrMsg]  = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [tab,     setTab]     = useState('search'); // search | all

  const bg    = isDark ? 'bg-[#060B17]'  : 'bg-[#F4F7FF]';
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const navBg = isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]';

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setPhase('loading');
    setErrMsg('');
    try {
      // Try by ID first, then by flight number
      let res;
      try       { res = await getFlightStatusById(query.trim()); }
      catch     { res = await getFlightStatusByNo(query.trim()); }
      setResult(res);
      setLastRefresh(new Date());
      setPhase('result');
    } catch (err) {
      setErrMsg(err.message);
      setPhase('error');
    }
  };

  const handleRefresh = async () => {
    if (!query.trim()) return;
    setPhase('loading');
    await handleSearch();
    toast.success('Status refreshed');
  };

  const QUICK_FLIGHTS = ['F001','F002','F003','F004','F005'];

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Nav */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
        <div className="container h-16 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            <ArrowLeft size={16}/> Dashboard
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-6 h-6 rounded-md bg-[#1956D6] flex items-center justify-center"><Radio size={11} className="text-white"/></div>
            <span className={`font-bold text-sm ${textH}`}>Flight Status</span>
          </div>
          {lastRefresh && (
            <span className={`ml-auto text-[10px] ${textS}`}>
              Updated {lastRefresh.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
            </span>
          )}
        </div>
      </nav>

      <div className="container py-8 max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1956D6] to-[#3B82F6] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#1956D6]/30">
            <Radio size={24} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${textH}`}>Real-time Flight Status</h1>
          <p className={`text-sm mt-1 ${textS}`}>Track any flight by ID or flight number</p>
        </div>

       

        {tab === 'search' && (
          <>
            {/* Search form */}
            <form onSubmit={handleSearch} className={`border rounded-2xl p-5 space-y-4 mb-6 ${card}`}>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${textS}`}>Flight ID or Number</label>
                  <div className="relative">
                    <input
                      id="flight-status-query"
                      value={query}
                      onChange={e => setQuery(e.target.value.toUpperCase())}
                      placeholder="e.g. F101 "
                      className={`w-full px-4 py-2.5 pr-10 rounded-xl border outline-none text-sm font-mono tracking-wide transition-all focus:border-[#1956D6]/60 focus:ring-2 focus:ring-[#1956D6]/10 ${isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/20' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                    />
                    <Search size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textS}`} />
                  </div>
                </div>
              </div>

             

              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary py-3 rounded-xl gap-2">
                  <Search size={15}/> Check Status
                </button>
                {result && (
                  <button type="button" onClick={handleRefresh} className={`px-4 py-3 rounded-xl border font-semibold text-sm transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-white/20' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <RefreshCw size={15} />
                  </button>
                )}
              </div>
            </form>

            {/* Loading */}
            {phase === 'loading' && (
              <div className={`border rounded-2xl p-16 flex flex-col items-center gap-4 ${card}`}>
                <Loader2 size={32} className="text-[#1956D6] animate-spin" />
                <p className={`text-sm ${textS}`}>Fetching flight status…</p>
              </div>
            )}

            {/* Error */}
            {phase === 'error' && (
              <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-400">Flight not found</p>
                  <p className={`text-xs mt-0.5 ${textS}`}>{errMsg}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {phase === 'result' && result && (
              <div className="space-y-4">
                <FlightStatusCard flight={result.flight} status={result.status} isDark={isDark} />

                {/* Flight timeline */}
                <div className={`border rounded-2xl p-5 ${card}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${textS}`}>Journey Timeline</p>
                  <div className="flex flex-col gap-4">
                    {[
                      { time: result.status.effectiveDep, label: result.flight.from, code: result.flight.fromCode, detail: `Terminal ${result.status.terminal} · Gate ${result.status.gate}`, done: result.status.progressPct > 0  },
                      { time: '',                          label: 'En Route',         code: '',                    detail: `${result.flight.durationLabel} · ${result.flight.stops === 0 ? 'Non-stop' : `${result.flight.stops} stop`}`, done: result.status.progressPct > 50 },
                      { time: result.status.effectiveArr, label: result.flight.to,   code: result.flight.toCode,  detail: 'Arrival terminal TBD',             done: result.status.progressPct >= 100 },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step.done ? 'border-[#1956D6] bg-[#1956D6]' : isDark ? 'border-white/20 bg-transparent' : 'border-slate-300 bg-transparent'}`}>
                            {step.done ? <CheckCircle size={14} className="text-white" /> : <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />}
                          </div>
                          {i < 2 && <div className={`w-px flex-1 h-8 ${step.done ? 'bg-[#1956D6]/40' : isDark ? 'bg-white/10' : 'bg-slate-200'}`} />}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-baseline gap-2">
                            {step.time && <span className={`text-base font-black ${textH} tabular-nums`}>{step.time}</span>}
                            {step.code && <span className="text-xs font-bold text-[#1956D6]">{step.code}</span>}
                          </div>
                          <div className={`text-sm font-semibold ${textH}`}>{step.label}</div>
                          <div className={`text-xs mt-0.5 ${textS}`}>{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* All flights tab */}
        {tab === 'all' && <AllFlightsList isDark={isDark} />}
      </div>
    </div>
  );
}
