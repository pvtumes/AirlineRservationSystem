import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, ArrowLeft, Clock3, Search,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Calendar, Users, Utensils, Armchair,
  ReceiptText, RefreshCw, Leaf, Drumstick, Ticket,
  MapPin, CreditCard, Loader2, WifiOff,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getAllBookings } from '../data/bookings.js';
import { cancelBooking } from '../services/cancelService.js';
import { fetchUserBookings } from '../services/bookingService.js';
import toast from 'react-hot-toast';

/* ── Helpers ────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ── API Booking Card ───────────────────────────────────── */
function ApiBookingCard({ booking, isDark }) {
  const [open, setOpen] = useState(false);
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const sep   = isDark ? 'border-white/[0.06]' : 'border-slate-100';
  const inner = isDark ? 'bg-white/[0.03]' : 'bg-slate-50';
  const pill  = isDark ? 'bg-white/[0.06] text-white/70' : 'bg-slate-100 text-slate-600';
  const sc = { confirmed:'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', cancelled:'bg-red-500/10 text-red-400 border-red-500/20' };
  const statusCls = sc[booking.status] ?? 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${card} hover:shadow-lg hover:border-[#1956D6]/20`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark?'bg-[#1956D6]/20':'bg-[#1956D6]/10'}`}>
            <Ticket size={18} className="text-[#1956D6]" />
          </div>
          <div>
            <div className={`text-base font-bold tracking-wider ${textH}`}>{booking.bookingRef}</div>
            <div className={`text-xs flex items-center gap-1 mt-0.5 ${textS}`}><MapPin size={10}/>{booking.flightFrom} → {booking.flightTo}</div>
          </div>
        </div>
        <div className={`hidden sm:flex items-center gap-2 ${textH}`}>
          <Plane size={12} className="text-[#1956D6] -rotate-45"/>
          <span className={`text-xs ${textS}`}>{booking.flightId}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${pill}`}>{booking.cabinClass}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-[#1956D6]">₹{booking.totalPrice?.toLocaleString('en-IN')}</div>
          <div className={`text-[10px] ${textS}`}>incl. GST</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusCls}`}>
            {booking.status==='confirmed'?<CheckCircle size={12}/>:<Clock3 size={12}/>} {booking.status}
          </span>
          <button onClick={()=>setOpen(v=>!v)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark?'hover:bg-white/[0.06]':'hover:bg-slate-100'}`}>
            {open?<ChevronUp size={14} className={textS}/>:<ChevronDown size={14} className={textS}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className={`border-t px-5 py-4 space-y-4 ${sep}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><p className={`text-[10px] uppercase font-bold mb-1 ${textS}`}>Travel Date</p><p className={`text-sm font-semibold ${textH}`}>{fmtDate(booking.travelDate)}</p></div>
            <div><p className={`text-[10px] uppercase font-bold mb-1 ${textS}`}>Departure</p><p className={`text-sm font-semibold ${textH}`}>{fmtTime(booking.departureTime)}</p></div>
            <div><p className={`text-[10px] uppercase font-bold mb-1 ${textS}`}>Arrival</p><p className={`text-sm font-semibold ${textH}`}>{fmtTime(booking.arrivalTime)}</p></div>
            <div><p className={`text-[10px] uppercase font-bold mb-1 ${textS}`}>Booked On</p><p className={`text-sm ${textH}`}>{fmtDate(booking.bookedAt)}</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><p className={`text-[10px] uppercase font-bold mb-1 ${textS}`}>Check-in</p><p className={`text-sm font-semibold ${booking.checkinStatus?.toLowerCase()==='done'?'text-emerald-500':'text-amber-500'}`}>{booking.checkinStatus||'Pending'}</p></div>
            <div><p className={`text-[10px] uppercase font-bold mb-1 flex items-center gap-1 ${textS}`}><CreditCard size={10}/>Payment</p><p className={`text-sm font-semibold ${textH}`}>{booking.paymentStatus||'Pending'}</p></div>
            {booking.routeType&&<div><p className={`text-[10px] uppercase font-bold mb-1 ${textS}`}>Route</p><p className={`text-sm font-semibold ${textH}`}>{booking.routeType}</p></div>}
          </div>
          <div className={`rounded-xl p-3 ${inner}`}>
            <p className={`text-[10px] uppercase font-bold mb-2 flex items-center gap-1 ${textS}`}><Utensils size={10}/>Meals</p>
            <div className="flex gap-4">
              {(booking.meals?.veg??0)>0&&<span className="flex items-center gap-1 text-emerald-500 text-sm"><Leaf size={12}/>{booking.meals.veg} Veg</span>}
              {(booking.meals?.nonVeg??0)>0&&<span className="flex items-center gap-1 text-orange-500 text-sm"><Drumstick size={12}/>{booking.meals.nonVeg} Non-veg</span>}
              {!booking.meals?.veg&&!booking.meals?.nonVeg&&<span className={`text-sm ${textS}`}>None</span>}
            </div>
          </div>
          <div className={`rounded-xl p-3 ${inner}`}>
            <p className={`text-[10px] uppercase font-bold mb-2 flex items-center gap-1 ${textS}`}><ReceiptText size={10}/>Price Breakdown</p>
            <div className={`space-y-1 text-sm ${textS}`}>
              <div className="flex justify-between"><span>Base fare</span><span className={textH}>₹{(booking.totalPrice-booking.tax).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>GST / Tax</span><span className={textH}>₹{booking.tax?.toLocaleString('en-IN')}</span></div>
              <div className={`flex justify-between font-bold pt-1 border-t text-base ${sep}`}><span className={textH}>Total</span><span className="text-[#1956D6]">₹{booking.totalPrice?.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Status badge ───────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };
  const icons = {
    confirmed: <CheckCircle size={12} />,
    cancelled: <XCircle size={12} />,
    pending: <Clock3 size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${map[status] ?? map.pending}`}>
      {icons[status] ?? null} {status}
    </span>
  );
}

/* ── Booking card ───────────────────────────────────────── */
function BookingCard({ booking, isDark, onCancel, cancelling }) {
  const [expanded, setExpanded] = useState(false);
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const sep = isDark ? 'border-white/[0.06]' : 'border-slate-100';

  const isCancelled = booking.status === 'cancelled';

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${card} ${isCancelled ? 'opacity-70' : 'hover:shadow-lg hover:border-[#1956D6]/20'}`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#1956D6]/20' : 'bg-[#1956D6]/10'}`}>
            <Ticket size={18} className="text-[#1956D6]" />
          </div>
          <div className="min-w-0">
            <div className={`text-base font-bold tracking-wider ${textH}`}>{booking.bookingRef}</div>
            <div className={`text-xs ${textS} flex items-center gap-2 mt-0.5`}>
              <Plane size={10} className="-rotate-45" />
              {booking.flightNo} · {booking.cabinClass} class
            </div>
          </div>
        </div>
        <div className={`hidden sm:flex items-center gap-2 text-sm font-semibold ${textH}`}>
          <span>{booking.passengers?.[0] ? booking.flightId?.slice(0, 3) : '—'}</span>
          <Plane size={12} className="text-[#1956D6] -rotate-45" />
          <span className={`text-xs ${textS}`}>{fmtDate(booking.bookedAt)}</span>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold text-[#1956D6]`}>₹{booking.totalPrice?.toLocaleString('en-IN')}</div>
          <div className={`text-[10px] ${textS}`}>{booking.passengers?.length ?? 1} pax · incl. GST</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={booking.status} />
          <button onClick={() => setExpanded(e => !e)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'}`}>
            {expanded ? <ChevronUp size={14} className={textS} /> : <ChevronDown size={14} className={textS} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className={`border-t px-5 py-4 space-y-4 ${sep}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className={`text-[10px] uppercase tracking-wide font-bold mb-1 ${textS}`}>Schedule ID</p>
              <p className={`text-sm font-semibold ${textH}`}>{booking.flightId}</p>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wide font-bold mb-1 flex items-center gap-1 ${textS}`}><Armchair size={10} /> Seats</p>
              <div className="flex flex-wrap gap-1">
                {booking.seats?.length ? booking.seats.map(s => (
                  <span key={s} className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/[0.06] text-white/70' : 'bg-slate-100 text-slate-600'}`}>{s}</span>
                )) : <span className={`text-sm ${textS}`}>—</span>}
              </div>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wide font-bold mb-1 flex items-center gap-1 ${textS}`}><Utensils size={10} /> Meals</p>
              <div className={`text-sm ${textH} space-y-0.5`}>
                {(booking.meals?.veg ?? 0) > 0 && <div className="flex items-center gap-1 text-emerald-500"><Leaf size={11} /> {booking.meals.veg} Veg</div>}
                {(booking.meals?.nonVeg ?? 0) > 0 && <div className="flex items-center gap-1 text-orange-500"><Drumstick size={11} /> {booking.meals.nonVeg} Non-veg</div>}
                {!booking.meals?.veg && !booking.meals?.nonVeg && <span className={textS}>None</span>}
              </div>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wide font-bold mb-1 flex items-center gap-1 ${textS}`}><Calendar size={10} /> Booked on</p>
              <p className={`text-sm ${textH}`}>{fmtDate(booking.bookedAt)}</p>
              <p className={`text-[10px] ${textS}`}>{fmtTime(booking.bookedAt)}</p>
            </div>
          </div>
          {booking.passengers?.length > 0 && (
            <div>
              <p className={`text-[10px] uppercase tracking-wide font-bold mb-2 flex items-center gap-1 ${textS}`}><Users size={10} /> Passengers</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {booking.passengers.map((p, i) => (
                  <div key={i} className={`text-sm rounded-xl px-3 py-2 flex items-center gap-2 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                    <div className={`w-6 h-6 rounded-full bg-[#1956D6]/10 text-[#1956D6] text-[10px] font-bold flex items-center justify-center`}>{i + 1}</div>
                    <div>
                      <div className={`font-semibold text-xs ${textH}`}>{p.name}</div>
                      <div className={`text-[10px] ${textS}`}>{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
            <p className={`text-[10px] uppercase tracking-wide font-bold mb-2 flex items-center gap-1 ${textS}`}><ReceiptText size={10} /> Price breakdown</p>
            <div className={`space-y-1 text-sm ${textS}`}>
              <div className="flex justify-between"><span>Base fare</span><span className={textH}>₹{booking.basePrice?.toLocaleString('en-IN')}</span></div>
              {booking.seatExtra > 0 && <div className="flex justify-between"><span>Seat extras</span><span className={textH}>₹{booking.seatExtra?.toLocaleString('en-IN')}</span></div>}
              {booking.mealCost > 0 && <div className="flex justify-between"><span>Meals</span><span className={textH}>₹{booking.mealCost?.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between"><span>GST (12%)</span><span className={textH}>₹{booking.tax?.toLocaleString('en-IN')}</span></div>
              <div className={`flex justify-between font-bold pt-1 border-t ${sep} text-base`}>
                <span className={textH}>Total</span>
                <span className="text-[#1956D6]">₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          {!isCancelled && (
            <button
              onClick={() => onCancel(booking.bookingRef)}
              disabled={cancelling === booking.bookingRef}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 ${isDark ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
            >
              {cancelling === booking.bookingRef
                ? <><RefreshCw size={13} className="animate-spin" /> Cancelling…</>
                : <><XCircle size={14} /> Cancel Booking</>
              }
            </button>
          )}
          {isCancelled && booking.cancelledAt && (
            <p className={`text-xs ${textS}`}>Cancelled on {fmtDate(booking.cancelledAt)} · Seats freed</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY BOOKINGS PAGE
═══════════════════════════════════════════════════════════ */
export default function MyBookings() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [localBookings, setLocalBookings] = useState([]);
  const [apiBookings,   setApiBookings]   = useState([]);
  const [apiLoading,    setApiLoading]    = useState(false);
  const [apiError,      setApiError]      = useState('');
  const [filter,        setFilter]        = useState('all');
  const [search,        setSearch]        = useState('');
  const [cancelling,    setCancelling]    = useState(null);

  const bookings = [...apiBookings, ...localBookings];

  // Auth guard
  useEffect(() => { if (!user) navigate('/', { replace: true }); }, [user, navigate]);

  // Local bookings
  const reloadLocal = useCallback(() => setLocalBookings(getAllBookings()), []);
  useEffect(() => { reloadLocal(); }, [reloadLocal]);

  // API bookings
  const fetchApi = useCallback(async () => {
    const uid = user?.user_id || user?.id;
    if (!uid) return;
    setApiLoading(true); setApiError('');
    try { setApiBookings(await fetchUserBookings(uid)); }
    catch (err) { setApiError(err.message || 'Could not reach bookings server.'); }
    finally { setApiLoading(false); }
  }, [user]);
  useEffect(() => { fetchApi(); }, [fetchApi]);

  const reload = useCallback(() => { reloadLocal(); fetchApi(); }, [reloadLocal, fetchApi]);

  const handleCancel = async (ref) => {
    const toastId = toast.loading('Cancelling booking…');
    setCancelling(ref);
    try {
      const updated = await cancelBooking(ref);
      setBookings(prev => prev.map(b => b.bookingRef === ref ? updated : b));
      toast.success(`Booking ${ref} cancelled. Seats have been freed.`, { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Cancellation failed.', { id: toastId });
    } finally {
      setCancelling(null);
    }
  };

  const displayed = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!search) return true;
      const s = search.toLowerCase();
      return b.bookingRef?.toLowerCase().includes(s) || b.flightNo?.toLowerCase().includes(s)
        || b.flightId?.toLowerCase().includes(s) || b.flightFrom?.toLowerCase().includes(s)
        || b.flightTo?.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(b.bookedAt||0) - new Date(a.bookedAt||0));

  const bg = isDark ? 'bg-[#060B17]' : 'bg-[#F4F7FF]';
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const navBg = isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]';

  if (!user) return null;

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Nav */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
        <div className="container h-16 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-6 h-6 rounded-md bg-[#1956D6] flex items-center justify-center">
              <Plane size={11} className="text-white -rotate-45" />
            </div>
            <span className={`font-bold text-sm ${textH}`}>My Bookings</span>
          </div>
          <span className={`ml-auto text-xs ${textS}`}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</span>
        </div>
      </nav>

      <div className="container py-8 space-y-6">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className={`relative flex-1 min-w-0`}>
            <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textS}`} />
            <input
              placeholder="Search by ref or flight number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-[#1956D6]/50 focus:ring-2 focus:ring-[#1956D6]/10 ${isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/25' : 'bg-white border-black/10 text-slate-800 placeholder-slate-400'}`}
            />
          </div>

          {/* Filter tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl shrink-0 ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f.key ? 'bg-[#1956D6] text-white shadow' : `${textS} hover:text-[#1956D6]`}`}>
                {f.label}
              </button>
            ))}
          </div>

          <button onClick={reload} title="Refresh" className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isDark ? 'border-white/10 text-white/50 hover:text-white hover:border-white/20' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Empty state */}
        {displayed.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-20 gap-4 border rounded-2xl ${isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]'}`}>
            <Plane size={44} className="text-[#1956D6] opacity-20" />
            <div className="text-center">
              <p className={`text-base font-bold ${textH}`}>
                {bookings.length === 0 ? 'No bookings yet' : 'No results found'}
              </p>
              <p className={`text-sm mt-1 ${textS}`}>
                {bookings.length === 0 ? 'Your booked flights will appear here.' : 'Try changing the filter or search term.'}
              </p>
            </div>
            {bookings.length === 0 && (
              <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2.5 rounded-xl text-sm">
                Search Flights
              </button>
            )}
          </div>
        )}

        {/* API banners */}
        {apiLoading && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${isDark?'bg-[#1956D6]/10 border-[#1956D6]/20 text-white/60':'bg-blue-50 border-blue-100 text-blue-600'}`}>
            <Loader2 size={14} className="animate-spin"/><span>Loading bookings from server…</span>
          </div>
        )}
        {apiError && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${isDark?'bg-amber-500/10 border-amber-500/20 text-amber-400':'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <WifiOff size={15} className="shrink-0"/><span className="flex-1">{apiError}</span>
            <button onClick={fetchApi} className="text-xs font-bold underline">Retry</button>
          </div>
        )}
        {/* Booking cards */}
        <div className="space-y-3">
          {displayed.map(b => b._source === 'api'
            ? <ApiBookingCard key={`api-${b.bookingRef}`} booking={b} isDark={isDark}/>
            : <BookingCard key={b.bookingRef} booking={b} isDark={isDark} onCancel={handleCancel} cancelling={cancelling}/>
          )}
        </div>
      </div>
    </div>
  );
}
