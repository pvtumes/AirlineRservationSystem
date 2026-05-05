/**
 * MiniDepartureBoard.jsx
 *
 * Airport-style FIDS (Flight Information Display System) showing
 * today's departures with real-time status computed from the clock.
 *
 * Uses flightStatusService.getAllFlightStatuses() — swap with API call later.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, RefreshCw, MonitorPlay, Clock, Loader2 } from 'lucide-react';
import { getAllFlightStatuses } from '../services/flightStatusService';

/* ── Clock hook ─────────────────────────────────────────── */
function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);
  return time;
}

/* ── Status config ──────────────────────────────────────── */
const STATUS_STYLE = {
  'scheduled':     { label: 'SCHEDULED',   cls: 'text-sky-300',           dotCls: 'bg-sky-400'     },
  'on-time':       { label: 'ON TIME',      cls: 'text-emerald-400',       dotCls: 'bg-emerald-400' },
  'delayed':       { label: 'DELAYED',      cls: 'text-amber-400 animate-pulse', dotCls: 'bg-amber-400'   },
  'boarding-soon': { label: 'BOARDING SOON',cls: 'text-violet-300',        dotCls: 'bg-violet-400'  },
  'boarding':      { label: 'BOARDING',     cls: 'text-yellow-300 animate-pulse font-black', dotCls: 'bg-yellow-400 animate-ping' },
  'departed':      { label: 'DEPARTED',     cls: 'text-slate-500',         dotCls: 'bg-slate-600'   },
  'landed':        { label: 'LANDED',       cls: 'text-emerald-600',       dotCls: 'bg-emerald-700' },
};

/* ── Individual row (with flip-in animation on update) ── */
function BoardRow({ flight, status, isEven }) {
  const navigate = useNavigate();
  const sCfg = STATUS_STYLE[status.statusKey] ?? STATUS_STYLE['scheduled'];
  const dimmed = ['departed', 'landed'].includes(status.statusKey);

  return (
    <tr
      onClick={() => navigate('/flight-status')}
      className={`cursor-pointer transition-colors duration-200 ${isEven ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.06]`}
      style={{ opacity: dimmed ? 0.45 : 1 }}
    >
      {/* Flight no */}
      <td className="px-4 py-3 font-mono font-black text-amber-300 text-sm whitespace-nowrap">
        {flight.flightNo}
      </td>

      {/* Destination */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex w-6 h-6 rounded bg-white/10 items-center justify-center shrink-0">
            <Plane size={10} className="text-amber-300 -rotate-45" />
          </div>
          <div>
            <div className="text-xs font-bold text-white/90 leading-tight">{flight.to}</div>
            <div className="text-[9px] text-white/40 font-bold tracking-wider">{flight.toCode}</div>
          </div>
        </div>
      </td>

      {/* Departs */}
      <td className="px-3 py-3 font-mono text-sm text-white/80 tabular-nums whitespace-nowrap">
        <div>{status.effectiveDep}</div>
        {status.delayed && (
          <div className="text-[9px] line-through text-white/30">{status.scheduledDep}</div>
        )}
      </td>

      {/* Gate */}
      <td className="px-3 py-3 text-center">
        <span className="font-black text-amber-300 text-sm">{status.gate}</span>
      </td>

      {/* Terminal */}
      <td className="hidden sm:table-cell px-3 py-3 text-center">
        <span className="text-xs font-bold text-white/50">{status.terminal}</span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className={`relative w-2 h-2 rounded-full shrink-0 ${sCfg.dotCls}`} />
          <span className={`text-[10px] font-black tracking-widest whitespace-nowrap ${sCfg.cls}`}>
            {sCfg.label}
          </span>
        </div>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════
   MINI DEPARTURE BOARD
══════════════════════════════════════════════════════════ */
export default function MiniDepartureBoard() {
  const navigate = useNavigate();
  const clock    = useLiveClock();
  const [rows,   setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = useCallback(async () => {
    try {
      const all = useEffect(() => {
  if (MODE === "API") return; // 🔥 stop calling

  getAllFlightStatuses();
}, []);      // Sort by departure time (HH:MM numeric)
      const sorted = [...all].sort((a, b) => {
        const toMins = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
        return toMins(a.flight.departureTime) - toMins(b.flight.departureTime);
      });
      setRows(sorted.slice(0, 10)); // show max 10 flights
      setLastUpdate(new Date());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Refresh every 60 s
  useEffect(() => { const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);

  const timeStr = clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = clock.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#04080F' }}>
      {/* Header — mimics airport board */}
      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg, #0A1428 0%, #0D1F3C 100%)', borderBottom: '1px solid rgba(251,191,36,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-400/10 border border-amber-400/20">
            <MonitorPlay size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-amber-300 font-black text-sm tracking-wider">DEPARTURES</div>
            <div className="text-white/40 text-[10px] font-bold tracking-widest">{dateStr.toUpperCase()}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live clock */}
          <div className="text-right">
            <div className="font-mono font-black text-xl text-amber-300 tabular-nums tracking-wider">{timeStr}</div>
            <div className="text-[9px] text-white/30 font-bold tracking-widest text-right">LOCAL TIME</div>
          </div>

          <button onClick={load} title="Refresh"
            className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/40 hover:text-amber-300 hover:border-amber-400/30 transition-all">
            <RefreshCw size={13}/>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="text-amber-400 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(251,191,36,0.10)' }}>
                {['FLIGHT', 'DESTINATION', 'DEPARTS', 'GATE', 'TERMINAL', 'STATUS'].map((h, i) => (
                  <th key={h}
                    className={`px-4 py-2.5 text-left text-[9px] font-black tracking-widest text-amber-500/60 ${i === 4 ? 'hidden sm:table-cell' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ flight, status }, i) => (
                <BoardRow key={flight.id} flight={flight} status={status} isEven={i % 2 === 0} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(251,191,36,0.08)' }}>
        <div className="text-[9px] text-white/20 font-bold tracking-widest">
          {lastUpdate && `Last updated ${lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
        </div>
        <button onClick={() => navigate('/flight-status')}
          className="text-[10px] font-black text-amber-400/60 hover:text-amber-400 transition-colors tracking-wider">
          FULL BOARD →
        </button>
      </div>
    </div>
  );
}
