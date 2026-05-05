import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, LogOut, Sun, Moon, Bell, ChevronRight, X,
  TrendingDown, Clock, MapPin, Shield, Headphones, Star, Heart,
  Ticket, Search, Radio, Users, User, CheckCircle,
  ArrowRight, Wallet, BarChart3, RefreshCw, Zap,
  Trophy, Gift, Crown, BellOff,
  XCircle, CalendarDays, ChevronDown,
} from 'lucide-react';
import { useAuth }        from '../context/AuthContext';
import { useTheme }       from '../context/ThemeContext';
import { useWishlist }    from '../context/WishlistContext';
import { getAllBookings } from '../data/bookings.js';
import { fetchUserBookings } from '../services/bookingService.js';
import FlightSearchForm   from '../components/FlightSearchForm';
import FlashDealsBanner   from '../components/FlashDealsBanner';
import DestinationCarousel from '../components/DestinationCarousel';
import MiniDepartureBoard  from '../components/MiniDepartureBoard';

/* ══════════════════════════════════════════════════════════
   LOYALTY TIER CONFIG
══════════════════════════════════════════════════════════ */
const TIERS = [
  {
    key: 'silver', label: 'Silver', minFlights: 0, maxFlights: 4,
    icon: Star,   color: '#94A3B8', grad: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400',
    perks: ['Priority boarding', 'Free seat selection', '10% discount on meals'],
  },
  {
    key: 'gold', label: 'Gold', minFlights: 5, maxFlights: 14,
    icon: Trophy, color: '#F59E0B', grad: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500',
    perks: ['Lounge access', 'Extra baggage 10kg', '20% discount on upgrades', 'Dedicated support'],
  },
  {
    key: 'platinum', label: 'Platinum', minFlights: 15, maxFlights: Infinity,
    icon: Crown, color: '#8B5CF6', grad: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400',
    perks: ['Unlimited lounge access', 'Free upgrades', '50% bonus points', 'Concierge service'],
  },
];

function getTier(flightCount) {
  return TIERS.slice().reverse().find(t => flightCount >= t.minFlights) ?? TIERS[0];
}
function getNextTier(current) {
  const idx = TIERS.findIndex(t => t.key === current.key);
  return TIERS[idx + 1] ?? null;
}

/* ══════════════════════════════════════════════════════════
   NOTIFICATIONS ENGINE
══════════════════════════════════════════════════════════ */
const NOTIF_READ_KEY = 'sv_notif_read';

function loadReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_READ_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function saveReadIds(ids) {
  try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...ids])); } catch { /**/ }
}

function generateNotifications(bookings, priceAlerts) {
  const notifs = [];
  const now    = new Date();

  // Booking confirmations
  [...bookings]
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
    .slice(0, 5)
    .forEach(b => {
      notifs.push({
        id:      `booking-${b.bookingRef}`,
        type:    'booking',
        icon:    CheckCircle,
        iconCls: 'text-emerald-500',
        bgCls:   'bg-emerald-500/10',
        title:   'Booking Confirmed',
        message: `${b.flightNo || b.flightId} · Ref: ${b.bookingRef}`,
        time:    b.bookedAt,
        action:  '/my-bookings',
      });
    });

  // Check-in available (confirmed, not yet checked in)
  bookings
    .filter(b => b.status === 'confirmed' && b.checkinStatus !== 'checked-in')
    .slice(0, 3)
    .forEach(b => {
      notifs.push({
        id:      `checkin-${b.bookingRef}`,
        type:    'checkin',
        icon:    Ticket,
        iconCls: 'text-[#1956D6]',
        bgCls:   'bg-[#1956D6]/10',
        title:   'Web Check-in Available',
        message: `${b.flightNo || b.flightId}: Online check-in is open`,
        time:    now.toISOString(),
        action:  '/checkin',
      });
    });

  // Cancellation notices
  [...bookings]
    .filter(b => b.status === 'cancelled' && b.cancelledAt)
    .sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt))
    .slice(0, 2)
    .forEach(b => {
      notifs.push({
        id:      `cancel-${b.bookingRef}`,
        type:    'cancel',
        icon:    XCircle,
        iconCls: 'text-red-400',
        bgCls:   'bg-red-500/10',
        title:   'Booking Cancelled',
        message: `${b.bookingRef} has been cancelled. Seats released.`,
        time:    b.cancelledAt,
        action:  '/my-bookings',
      });
    });

  // Active price alerts
  priceAlerts.slice(0, 3).forEach(a => {
    notifs.push({
      id:      `alert-${a.id}`,
      type:    'alert',
      icon:    TrendingDown,
      iconCls: 'text-amber-500',
      bgCls:   'bg-amber-500/10',
      title:   'Price Alert Active',
      message: `${a.from} → ${a.to}: watching for prices below ₹${a.targetPrice?.toLocaleString('en-IN')}`,
      time:    a.createdAt,
      action:  '/profile',
    });
  });

  return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return 'Just now';
}

/* ══════════════════════════════════════════════════════════
   NOTIFICATION TRAY (inline in nav)
══════════════════════════════════════════════════════════ */
function NotificationTray({ bookings, isDark }) {
  const navigate = useNavigate();
  const { priceAlerts } = useWishlist();
  const [open,    setOpen]    = useState(false);
  const [readIds, setReadIds] = useState(loadReadIds);
  const trayRef = useRef();

  const notifications = useMemo(
    () => generateNotifications(bookings, priceAlerts),
    [bookings, priceAlerts],
  );
  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (trayRef.current && !trayRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => {
    const next = new Set([...readIds, ...notifications.map(n => n.id)]);
    setReadIds(next);
    saveReadIds(next);
  };

  const markRead = (id) => {
    const next = new Set([...readIds, id]);
    setReadIds(next);
    saveReadIds(next);
  };

  const handleClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    navigate(notif.action);
  };

  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  return (
    <div className="relative" ref={trayRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-white/50 hover:bg-white/[0.06] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'} ${open ? (isDark ? 'bg-white/[0.06] text-white' : 'bg-slate-100 text-slate-800') : ''}`}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-12 w-80 sm:w-96 border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-[200] ${card}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[#1956D6]" />
              <span className={`text-sm font-bold ${textH}`}>Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} className={`text-[11px] font-semibold text-[#1956D6] hover:underline px-2`}>
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? 'hover:bg-white/[0.06] text-white/40' : 'hover:bg-slate-100 text-slate-400'}`}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <BellOff size={28} className={textS} />
                <p className={`text-sm ${textS}`}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const Icon   = notif.icon;
                const isRead = readIds.has(notif.id);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b last:border-b-0 ${isDark ? 'border-white/[0.04] hover:bg-white/[0.03]' : 'border-slate-50 hover:bg-slate-50'} ${!isRead ? (isDark ? 'bg-[#1956D6]/[0.04]' : 'bg-blue-50/50') : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${notif.bgCls}`}>
                      <Icon size={14} className={notif.iconCls} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-start justify-between gap-2`}>
                        <span className={`text-xs font-bold ${textH} leading-tight`}>{notif.title}</span>
                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#1956D6] shrink-0 mt-1.5" />}
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${textS} line-clamp-2`}>{notif.message}</p>
                      <p className={`text-[10px] mt-1 ${isDark ? 'text-white/25' : 'text-slate-400'}`}>{timeAgo(notif.time)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-4 py-2.5 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
              <button onClick={() => { setOpen(false); navigate('/my-bookings'); }}
                className={`text-xs font-semibold text-[#1956D6] hover:underline`}>
                View all bookings →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOP NAV (with notification tray wired)
══════════════════════════════════════════════════════════ */
function DashboardNav({ bookings }) {
  const { user, logout }      = useAuth();
  const { isDark, setIsDark } = useTheme();
  const { wishlist }          = useWishlist();
  const navigate              = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const navBg = isDark ? 'bg-[#060B17]/95 border-white/[0.07]' : 'bg-white/95 border-black/[0.07]';

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-[#1956D6] flex items-center justify-center">
            <Plane size={15} className="text-white -rotate-45" />
          </div>
          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Sky<span className="text-[#1956D6]">Voyage</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'My Bookings',   path: '/my-bookings'  },
            { label: 'Check-in',      path: '/checkin'       },
            { label: 'Flight Status', path: '/flight-status' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`text-sm font-medium transition-colors nav-link ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/profile')} title="Wishlist"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-white/50 hover:bg-white/[0.06] hover:text-rose-400' : 'text-slate-500 hover:bg-slate-100 hover:text-rose-500'}`}>
            <Heart size={17} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                {wishlist.length > 9 ? '9+' : wishlist.length}
              </span>
            )}
          </button>

          {/* ← Live notification tray */}
          <NotificationTray bookings={bookings} isDark={isDark} />

          <button onClick={() => setIsDark(d => !d)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-white/50 hover:bg-white/[0.06] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-2 ml-1 pl-3 border-l border-current/10 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1956D6] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold shadow-md">
              {initials}
            </div>
            <span className={`hidden sm:block text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          <button onClick={handleLogout} title="Log out"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-white/40 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   LOYALTY / REWARDS PROGRESS BAR  (Phase 2)
══════════════════════════════════════════════════════════ */
function LoyaltyCard({ bookings, isDark }) {
  const navigate  = useNavigate();
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  const confirmedCount = useMemo(
    () => bookings.filter(b => b.status === 'confirmed').length,
    [bookings],
  );
  const totalSpent = useMemo(
    () => bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalPrice ?? 0), 0),
    [bookings],
  );
  const points = 2500 + confirmedCount * 500 + Math.round(totalSpent / 100);

  const currentTier = getTier(confirmedCount);
  const nextTier    = getNextTier(currentTier);
  const TierIcon    = currentTier.icon;

  // Progress within current tier
  const tierFlights  = nextTier ? nextTier.minFlights - currentTier.minFlights : 1;
  const flightsDone  = confirmedCount - currentTier.minFlights;
  const progressPct  = nextTier
    ? Math.min(100, (flightsDone / tierFlights) * 100)
    : 100;

  const [showPerks, setShowPerks] = useState(false);

  return (
    <div className={`border rounded-2xl overflow-hidden ${card}`}>
      {/* Premium gradient header */}
      <div className={`bg-gradient-to-r ${currentTier.grad} p-5`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <TierIcon size={18} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest">SkyVoyage Rewards</div>
                <div className="text-lg font-black text-white">{currentTier.label} Member</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Points Balance</div>
            <div className="text-2xl font-black text-white tabular-nums">{points.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-white/60">≈ ₹{Math.round(points / 10).toLocaleString('en-IN')} value</div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {nextTier ? (
          <>
            {/* Progress section */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${currentTier.bg} ${currentTier.border} ${currentTier.text}`}>
                  {currentTier.label}
                </span>
                <ChevronRight size={12} className={textS} />
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${nextTier.bg} ${nextTier.border} ${nextTier.text}`}>
                  {nextTier.label}
                </span>
              </div>
              <span className={`text-xs font-semibold ${textS}`}>
                {confirmedCount}/{nextTier.minFlights} flights
              </span>
            </div>

            {/* Progress bar */}
            <div className={`relative h-2.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/[0.07]' : 'bg-slate-100'}`}>
              <div
                className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${currentTier.grad} transition-all duration-1000 ease-out`}
                style={{ width: `${progressPct}%` }}
              />
              {/* Tier markers */}
              {TIERS.slice(1).map(t => {
                const pos = nextTier ? (t.minFlights / nextTier.minFlights) * 100 : 100;
                if (pos >= 100) return null;
                return (
                  <div key={t.key}
                    className={`absolute top-0 h-full w-0.5 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`}
                    style={{ left: `${pos}%` }}
                  />
                );
              })}
            </div>

            <p className={`text-xs ${textS} mb-4`}>
              <span className="font-bold text-[#1956D6]">{nextTier.minFlights - confirmedCount} more flight{nextTier.minFlights - confirmedCount !== 1 ? 's' : ''}</span>
              {' '}to unlock {nextTier.label} status and {nextTier.perks[0].toLowerCase()}
            </p>
          </>
        ) : (
          <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl ${isDark ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-100'}`}>
            <Crown size={14} className="text-violet-500" />
            <span className="text-xs font-semibold text-violet-500">You've reached the highest tier! Enjoy all Platinum benefits.</span>
          </div>
        )}

        {/* Tier milestone pills */}
        <div className="flex gap-2 mb-4">
          {TIERS.map(t => {
            const TIcon    = t.icon;
            const achieved = confirmedCount >= t.minFlights;
            return (
              <div key={t.key}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all ${achieved ? `${t.bg} ${t.border}` : isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
                <TIcon size={14} className={achieved ? t.text : textS} />
                <span className={`text-[9px] font-bold uppercase tracking-wide ${achieved ? t.text : textS}`}>{t.label}</span>
                <span className={`text-[9px] ${achieved ? t.text : textS} opacity-60`}>{t.minFlights}+ flights</span>
              </div>
            );
          })}
        </div>

        {/* Expandable perks */}
        <button
          onClick={() => setShowPerks(p => !p)}
          className={`w-full flex items-center justify-between text-xs font-semibold ${textS} hover:text-[#1956D6] transition-colors`}
        >
          <span className="flex items-center gap-1.5"><Gift size={12}/> Current {currentTier.label} benefits</span>
          <ChevronDown size={13} className={`transition-transform ${showPerks ? 'rotate-180' : ''}`} />
        </button>
        {showPerks && (
          <ul className={`mt-3 space-y-1.5 text-xs ${textS}`}>
            {currentTier.perks.map(p => (
              <li key={p} className="flex items-center gap-2">
                <CheckCircle size={11} className={currentTier.text} />
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RECENT BOOKINGS INLINE  (Phase 2)
══════════════════════════════════════════════════════════ */
function StatusPill({ status }) {
  const map = {
    confirmed:  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
    'checked-in': 'bg-[#1956D6]/10 text-[#1956D6] border-[#1956D6]/20',
  };
  const icons = { confirmed: <CheckCircle size={10}/>, cancelled: <XCircle size={10}/>, 'checked-in': <Ticket size={10}/> };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${map[status] ?? map.confirmed}`}>
      {icons[status] ?? null} {status === 'checked-in' ? 'Checked In' : status}
    </span>
  );
}

function RecentBookings({ bookings, isDark }) {
  const navigate = useNavigate();
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  const recent = useMemo(() =>
    [...bookings]
      .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
      .slice(0, 3),
  [bookings]);

  return (
    <div className={`border rounded-2xl overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
            <CalendarDays size={15} className="text-[#1956D6]" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${textH}`}>Recent Bookings</h2>
            <p className={`text-[10px] ${textS}`}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => navigate('/my-bookings')}
          className="text-xs font-semibold text-[#1956D6] hover:underline flex items-center gap-1">
          View all <ArrowRight size={12}/>
        </button>
      </div>

      {/* Bookings list */}
      {recent.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'} flex items-center justify-center`}>
            <Ticket size={22} className={`${textS} opacity-40`} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${textH}`}>No bookings yet</p>
            <p className={`text-xs mt-0.5 ${textS}`}>Your recent reservations will appear here</p>
          </div>
          <button onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary px-5 py-2 rounded-xl text-xs gap-1.5">
            <Search size={12}/> Find a Flight
          </button>
        </div>
      ) : (
        <div>
          {recent.map((b, i) => {
            const isLast  = i === recent.length - 1;
            const isCI    = b.checkinStatus === 'checked-in';
            const effStatus = isCI ? 'checked-in' : b.status;
            return (
              <div key={b.bookingRef}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 transition-all ${!isLast ? `border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}` : ''} ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>

                {/* Airline badge */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1956D6] to-[#3B82F6] flex items-center justify-center text-white text-xs font-black shrink-0 shadow">
                  {b.flightNo?.split(' ')[0] ?? 'SV'}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${textH}`}>
                      {b.flightFrom || '—'} → {b.flightTo || '—'}
                    </span>
                    <StatusPill status={effStatus} />
                  </div>
                  <div className={`text-xs mt-0.5 ${textS} flex flex-wrap items-center gap-x-2 gap-y-0.5`}>
                    <span className="font-mono font-bold text-[#1956D6]">{b.bookingRef}</span>
                    <span>·</span>
                    <span>{b.flightNo}</span>
                    <span>·</span>
                    <span>{b.cabinClass} class</span>
                    <span>·</span>
                    <span>{b.passengers?.length ?? 1} pax</span>
                  </div>
                  <div className={`text-[10px] mt-1 ${textS}`}>
                    {new Date(b.bookedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Price + actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <div className={`text-base font-black text-[#1956D6]`}>
                    ₹{b.totalPrice?.toLocaleString('en-IN') ?? '—'}
                  </div>
                  <div className="flex gap-1.5">
                    {b.status === 'confirmed' && !isCI && (
                      <button onClick={() => navigate('/checkin')}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all bg-[#1956D6]/10 text-[#1956D6] border border-[#1956D6]/20 hover:bg-[#1956D6] hover:text-white`}>
                        Check-in
                      </button>
                    )}
                    <button onClick={() => navigate('/my-bookings')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${isDark ? 'bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          {bookings.length > 3 && (
            <div className={`px-5 py-3 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'} flex items-center justify-center`}>
              <button onClick={() => navigate('/my-bookings')}
                className={`text-xs font-semibold text-[#1956D6] hover:underline flex items-center gap-1.5`}>
                <ArrowRight size={12}/> See all {bookings.length} bookings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COUNTDOWN HOOK
══════════════════════════════════════════════════════════ */
function useCountdown(targetHHMM) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!targetHHMM || targetHHMM === '—') return;
    const tick = () => {
      const now  = new Date();
      const [h, m] = targetHHMM.split(':').map(Number);
      let target = new Date(now);
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const hours = Math.floor(diff / 3_600_000);
      const mins  = Math.floor((diff % 3_600_000) / 60_000);
      const secs  = Math.floor((diff % 60_000) / 1_000);
      setLabel(hours > 0 ? `${hours}h ${mins}m ${secs}s` : `${mins}m ${secs}s`);
    };
    tick();
    const t = setInterval(tick, 1_000);
    return () => clearInterval(t);
  }, [targetHHMM]);
  return label;
}

/* ══════════════════════════════════════════════════════════
   UPCOMING TRIP WIDGET  (Phase 1, preserved)
══════════════════════════════════════════════════════════ */
function UpcomingTripWidget({ bookings, isDark }) {
  const navigate = useNavigate();
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next = useMemo(() => {
    // Prefer future trips by travelDate; fall back to most-recently-booked confirmed
    const confirmed = bookings.filter(b => b.status === 'confirmed');

    // API bookings have travelDate; pick the soonest upcoming one
    const upcoming = confirmed
      .filter(b => b.travelDate && new Date(b.travelDate) >= today)
      .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));

    if (upcoming.length) return upcoming[0];

    // Fallback: most recently booked confirmed (local bookings)
    return confirmed
      .sort((a, b) => new Date(b.bookedAt || 0) - new Date(a.bookedAt || 0))[0] ?? null;
  }, [bookings]);

  const countdown = useCountdown(next?.flightDeparture ?? null);

  if (!next) {
    return (
      <div className={`relative overflow-hidden border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 ${isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#1956D6]/5 blur-3xl pointer-events-none" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1956D6]/10 to-[#3B82F6]/10 border border-[#1956D6]/20 flex items-center justify-center shrink-0">
          <Plane size={32} className="text-[#1956D6] -rotate-45 opacity-60" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className={`text-base font-bold ${textH}`}>No upcoming trips</h3>
          <p className={`text-sm mt-1 ${textS}`}>Book your next flight and it'll appear here with a live countdown.</p>
        </div>
        <button onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm gap-2 shrink-0">
          <Search size={15}/> Search Flights
        </button>
      </div>
    );
  }

  const isCI = next.checkinStatus === 'checked-in';
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(25,86,214,0.25)' }}>
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1956D6] via-[#3B82F6] to-[#60A5FA]" />
      <div className={`p-5 sm:p-6 ${isDark ? 'bg-[#0A1428]' : 'bg-gradient-to-br from-blue-50/80 to-white'}`}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1956D6]/10 text-[#1956D6] border border-[#1956D6]/20 mb-2">
              <Plane size={10} className="-rotate-45"/> Upcoming Trip
            </span>
            <h2 className={`text-xl font-bold ${textH}`}>
              {next.flightFrom ?? '—'} <span className="text-[#1956D6] mx-1">→</span> {next.flightTo ?? '—'}
            </h2>
            <p className={`text-xs mt-0.5 ${textS}`}>{next.flightNo} · {next.cabinClass} class · {next.passengers?.length ?? 1} pax</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-[10px] font-bold uppercase tracking-widest ${textS} mb-0.5`}>
              {next.flightDeparture ? 'Departs in' : 'Booked'}
            </div>
            <div className="text-2xl font-black text-[#1956D6] tabular-nums leading-none">
              {countdown || new Date(next.bookedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
            {next.flightDeparture && <div className={`text-[10px] ${textS} mt-0.5 tabular-nums`}>at {next.flightDeparture}</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Ticket, label: 'PNR',       val: next.bookingRef },
            { icon: User,   label: 'Passenger',  val: next.passengers?.[0]?.name?.split(' ')[0] ?? '—' },
            { icon: MapPin, label: 'Seat(s)',    val: next.seats?.join(', ') ?? '—' },
            { icon: Wallet, label: 'Total Paid', val: `₹${next.totalPrice?.toLocaleString('en-IN')}` },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className={`rounded-xl px-3 py-2.5 ${isDark ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-white/80 border-slate-200/80'} border`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-0.5 ${textS}`}><Icon size={9}/>{label}</div>
              <div className={`text-sm font-bold truncate ${textH}`}>{val}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isCI ? (
            <button onClick={() => navigate('/checkin')} className="btn-primary px-4 py-2 rounded-xl text-sm gap-2">
              <CheckCircle size={14}/> Web Check-in
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle size={13}/> Checked In
            </span>
          )}
          <button onClick={() => navigate('/my-bookings')} className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-[#1956D6]/30 hover:text-[#1956D6]' : 'border-slate-200 text-slate-600 hover:border-[#1956D6]/30 hover:text-[#1956D6]'}`}>
            View Details <ArrowRight size={13} className="inline ml-1"/>
          </button>
          <button onClick={() => navigate('/flight-status')} className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${isDark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-slate-200 text-slate-600 hover:border-violet-500/30 hover:text-violet-500'}`}>
            <Radio size={12} className="inline mr-1.5"/>Flight Status
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   QUICK ACTIONS GRID  (Phase 1, preserved)
══════════════════════════════════════════════════════════ */
const QUICK_ACTIONS = [
  { icon: Search,      label: 'Search Flights', desc: 'Find the best deals',      scroll: true,  grad: 'from-[#1956D6] to-[#3B82F6]',   glow: 'shadow-blue-500/20' },
  { icon: CheckCircle, label: 'Web Check-in',   desc: 'Check in online',          path: '/checkin',        grad: 'from-emerald-500 to-teal-500',   glow: 'shadow-emerald-500/20' },
  { icon: Ticket,      label: 'My Bookings',    desc: 'View all reservations',    path: '/my-bookings',    grad: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-500/20' },
  { icon: Radio,       label: 'Flight Status',  desc: 'Real-time tracking',       path: '/flight-status',  grad: 'from-amber-500 to-orange-500',   glow: 'shadow-amber-500/20' },
  { icon: User,        label: 'My Profile',     desc: 'Manage your account',      path: '/profile',        grad: 'from-slate-500 to-slate-700',    glow: 'shadow-slate-500/20' },
];

function QuickActionsGrid({ isDark }) {
  const navigate = useNavigate();
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const handle = (a) => a.scroll
    ? document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })
    : navigate(a.path);
  return (
    <div>
      <h2 className={`text-lg font-bold mb-4 ${textH}`}>Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={() => handle(a)}
              className={`group flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border transition-all duration-200 text-center hover:-translate-y-1 hover:shadow-xl ${a.glow} ${isDark ? 'bg-[#0F1929] border-white/[0.07] hover:border-white/15' : 'bg-white border-black/[0.07] hover:border-[#1956D6]/20'}`}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-lg ${a.glow} transition-transform duration-200 group-hover:scale-110`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className={`text-xs font-bold ${textH} leading-tight`}>{a.label}</div>
                <div className={`text-[10px] mt-0.5 ${textS} leading-tight`}>{a.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TRAVEL STATS  (Phase 1, preserved)
══════════════════════════════════════════════════════════ */
function AnimatedNumber({ target, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 40; let curr = 0;
    const t = setInterval(() => {
      curr += target / steps;
      if (curr >= target) { setDisplay(target); clearInterval(t); }
      else setDisplay(Math.round(curr));
    }, 900 / steps);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{display.toLocaleString('en-IN')}{suffix}</>;
}

function TravelStats({ bookings, isDark }) {
  const navigate = useNavigate();
  const textH = isDark ? 'text-white' : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const spent     = confirmed.reduce((s,b) => s + (b.totalPrice??0), 0);
  const routes    = new Set(confirmed.map(b => b.flightId)).size;
  const totalPax  = confirmed.reduce((s,b) => s + (b.passengers?.length??1), 0);
  const points    = 2500 + confirmed.length * 500 + Math.round(spent/100);
  const airl      = {};
  confirmed.forEach(b => { const c = b.flightNo?.split(' ')[0]??'?'; airl[c]=(airl[c]??0)+1; });
  const fav = Object.entries(airl).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';

  const CARDS = [
    { icon: Ticket,   label: 'Total Bookings',    value: confirmed.length, sub: cancelled.length>0?`${cancelled.length} cancelled`:'All active', color:'text-[#1956D6]', bg:'bg-[#1956D6]/10', action:()=>navigate('/my-bookings') },
    { icon: Wallet,   label: 'Total Spent',        value: spent, prefix:'₹', sub: confirmed.length>0?`Avg ₹${Math.round(spent/confirmed.length).toLocaleString('en-IN')}/trip`:'No trips yet', color:'text-emerald-500', bg:'bg-emerald-500/10' },
    { icon: Star,     label: 'Reward Points',      value: points, sub:'Silver tier · 500 to Gold', color:'text-amber-500', bg:'bg-amber-500/10' },
    { icon: Clock,    label: 'Hours in Air',       value: confirmed.length*2, suffix:'h', sub:`${routes} route${routes!==1?'s':''} flown`, color:'text-violet-500', bg:'bg-violet-500/10' },
    { icon: Users,    label: 'Passengers Flown',   value: totalPax, sub: confirmed.length>0?`Avg ${(totalPax/confirmed.length).toFixed(1)} per trip`:'Book your first trip', color:'text-rose-500', bg:'bg-rose-500/10' },
    { icon: BarChart3,label: 'Fav Airline',        value: null, custom: fav, sub: confirmed.length>0?'Most flown carrier':'—', color:'text-sky-500', bg:'bg-sky-500/10' },
  ];
  return (
    <div>
      <h2 className={`text-lg font-bold mb-4 ${textH}`}>Your Travel Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CARDS.map(({ icon: Icon, label, value, prefix='', suffix='', sub, color, bg, custom, action }) => (
          <button key={label} onClick={action} disabled={!action}
            className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-200 ${action?'hover:-translate-y-1 hover:shadow-lg cursor-pointer':'cursor-default'} ${card}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon size={16} className={color}/></div>
            <div className={`text-xl font-black ${textH} tabular-nums leading-none`}>
              {custom!==undefined ? <span className={color}>{custom}</span> : <AnimatedNumber target={value} prefix={prefix} suffix={suffix}/>}
            </div>
            <div>
              <div className={`text-[10px] font-bold ${textS} leading-tight`}>{label}</div>
              <div className={`text-[10px] mt-0.5 ${textS} opacity-60 leading-tight`}>{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   POPULAR ROUTES + FEATURES (preserved)
══════════════════════════════════════════════════════════ */
const POPULAR_ROUTES = [
  { from: 'Mumbai', to: 'Delhi',     price: '₹3,650', tag: 'Most popular' },
  { from: 'Delhi',  to: 'Bangalore', price: '₹4,300', tag: 'Trending' },
  { from: 'Mumbai', to: 'Goa',       price: '₹2,800', tag: 'Weekend deal' },
  { from: 'Mumbai', to: 'Dubai',     price: '₹15,200', tag: 'International' },
];
const FEATURES = [
  { icon: Shield,     label: 'Safe Booking',    desc: 'Secure & encrypted payments' },
  { icon: Zap,        label: 'Instant Confirm', desc: 'Booking confirmed in seconds' },
  { icon: Headphones, label: '24/7 Support',    desc: 'Always here to help' },
];

/* ══════════════════════════════════════════════════════════
   DASHBOARD (main)
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user }   = useAuth();
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const [localBookings, setLocalBookings] = useState([]);
  const [apiBookings,   setApiBookings]   = useState([]);

  const bookings = useMemo(
    () => [...apiBookings, ...localBookings],
    [apiBookings, localBookings],
  );

  const reload = useCallback(() => setLocalBookings(getAllBookings()), []);
  useEffect(() => { reload(); }, [reload]);

  // Fetch bookings from server
  useEffect(() => {
    const uid = user?.user_id || user?.id;
    if (!uid) return;
    fetchUserBookings(uid)
      .then(setApiBookings)
      .catch(() => { /* silently fall back to local only */ });
  }, [user]);

  useEffect(() => { if (!user) navigate('/', { replace: true }); }, [user, navigate]);
  if (!user) return null;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const bg    = isDark ? 'bg-[#060B17]' : 'bg-[#F4F7FF]';
  const card  = isDark ? 'bg-[#0F1929] border-white/[0.07]' : 'bg-white border-black/[0.07]';
  const textH = isDark ? 'text-white'    : 'text-slate-800';
  const textS = isDark ? 'text-white/50' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bg}`}>
      <DashboardNav bookings={bookings} />

      <main className="container py-8 space-y-10">

        {/* ── Welcome ── */}
        <div className="flex items-center justify-between anim-fade-up">
          <div>
            <p className={`text-sm font-medium ${textS} mb-1`}>{greeting} ✈️</p>
            <h1 className={`text-3xl font-bold ${textH}`}>
              Welcome back, <span className="text-[#1956D6]">{user.name?.split(' ')[0]}</span>!
            </h1>
            <p className={`text-sm mt-1 ${textS}`}>Here's your travel overview for today.</p>
          </div>
          <button onClick={reload} title="Refresh"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isDark ? 'border-white/10 text-white/40 hover:text-white hover:border-white/20' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`}>
            <RefreshCw size={15}/>
          </button>
        </div>

        {/* ── Phase 1: Upcoming Trip ── */}
        <div className="anim-fade-up delay-1">
          <h2 className={`text-lg font-bold mb-4 ${textH}`}>Upcoming Trip</h2>
          <UpcomingTripWidget bookings={bookings} isDark={isDark}/>
        </div>

        {/* ── Phase 1: Quick Actions ── */}
        <div className="anim-fade-up delay-2">
          <QuickActionsGrid isDark={isDark}/>
        </div>

        {/* ── Phase 3: Flash Deals Banner ── */}
        <div className="anim-fade-up delay-3">
          <h2 className={`text-lg font-bold mb-4 ${textH}`}>Flash Deals</h2>
          <FlashDealsBanner isDark={isDark}/>
        </div>

        {/* ── Phase 2: Loyalty Rewards ── */}
        <div className="anim-fade-up delay-3">
          <h2 className={`text-lg font-bold mb-4 ${textH}`}>Loyalty & Rewards</h2>
          <LoyaltyCard bookings={bookings} isDark={isDark}/>
        </div>

        {/* ── Phase 2: Recent Bookings ── */}
        <div className="anim-fade-up delay-4">
          <RecentBookings bookings={bookings} isDark={isDark}/>
        </div>

        {/* ── Phase 1: Travel Stats ── */}
        <div className="anim-fade-up">
          <TravelStats bookings={bookings} isDark={isDark}/>
        </div>

        {/* ── Phase 3: Destination Inspiration Carousel ── */}
        <div className="anim-fade-up">
          <DestinationCarousel isDark={isDark}/>
        </div>

        {/* ── Phase 3: Mini Departure Board ── */}
        <div className="anim-fade-up">
          <h2 className={`text-lg font-bold mb-4 ${textH}`}>Today's Departures</h2>
          <MiniDepartureBoard/>
        </div>

        {/* ── Search form ── */}
        <div id="search-section" className="anim-fade-up">
          <h2 className={`text-lg font-bold mb-4 ${textH}`}>Search Flights</h2>
          <FlightSearchForm/>
        </div>

        {/* ── Popular Routes ── */}
        <div className="anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${textH}`}>Popular Routes</h2>
            <button className="text-sm text-[#1956D6] font-semibold hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_ROUTES.map(route => (
              <button key={`${route.from}-${route.to}`}
                onClick={() => navigate('/results', { state: { from: route.from, to: route.to, date: '', passengers: 1, tripClass: 'economy', tripType: 'one-way' } })}
                className={`border rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-[#1956D6]/30 ${card}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1956D6]/10 text-[#1956D6]">{route.tag}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${textH}`}>
                  <span>{route.from}</span><Plane size={13} className="text-[#1956D6] -rotate-45"/><span>{route.to}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${textS}`}>Starting from</span>
                  <span className="text-base font-bold text-[#1956D6]">{route.price}</span>
                </div>
                <div className="mt-2 flex items-center text-xs font-semibold text-[#1956D6]">
                  Search <ChevronRight size={12} className="ml-1"/>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 anim-fade-up">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className={`border rounded-xl p-5 flex items-center gap-4 ${card}`}>
              <div className="w-11 h-11 rounded-xl bg-[#1956D6]/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-[#1956D6]"/>
              </div>
              <div>
                <div className={`text-sm font-bold ${textH}`}>{label}</div>
                <div className={`text-xs mt-0.5 ${textS}`}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
