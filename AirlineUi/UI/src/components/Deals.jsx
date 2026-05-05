import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEALS = [
  { from:'Pune', to:'Delhi', fromCity:'Pune',    toCity:'Delhi',       price:'₹18,499', was:'₹27,999', off:'34%', h:12, img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80', tag:'Flash Sale' },
  { from:'DEL', to:'SIN', fromCity:'Delhi',     toCity:'Singapore',   price:'₹22,999', was:'₹34,999', off:'34%', h:8,  img:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80', tag:'Limited Seats' },
  { from:'BLR', to:'DPS', fromCity:'Bangalore', toCity:'Bali',        price:'₹28,499', was:'₹40,000', off:'29%', h:17, img:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80', tag:'Best Deal' },
];

function Countdown({ hours }) {
  const [s, setS] = useState(hours * 3600);
  useEffect(() => {
    const t = setInterval(() => setS(v => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return (
    <span className="font-mono font-semibold text-[#C8963A]">
      {pad(h)}:{pad(m)}:{pad(sec)}
    </span>
  );
}

export default function Deals() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  const handleBook = (deal) => {
    requireAuth(() => {
      navigate('/results', {
        state: { 
          from: deal.fromCity, 
          to: deal.toCity, 
          date: new Date().toISOString().split('T')[0], 
          passengers: 1, 
          tripClass: 'economy', 
          tripType: 'one-way' 
        }
      });
    }, 'signin');
  };

  return (
    <section id="deals" className={`section ${isDark ? 'bg-[#060B17]' : 'bg-[#F4F7FF]'}`}>
      <div className="container">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#1956D6] text-sm font-semibold uppercase tracking-widest mb-3">Hot Deals</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-1)] tracking-tight">
              Today's Best Fares
            </h2>
            <p className={`mt-2 text-base ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              Prices drop daily. Grab yours before they're gone.
            </p>
          </div>
          <button className="hidden md:flex btn-outline text-sm py-2.5 px-5 gap-2">
            All Deals <ArrowRight size={15} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEALS.map(d => (
            <div key={d.from + d.to} className="card overflow-hidden group">
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img src={d.img} alt={d.toCity}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C8963A] text-white text-xs font-semibold">
                  {d.tag}
                </span>
                <span className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  -{d.off}
                </span>
              </div>

              <div className="p-5">
                {/* Route */}
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{d.from}</div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{d.fromCity}</div>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <ArrowRight size={13} className="text-[#1956D6] shrink-0" />
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{d.to}</div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{d.toCity}</div>
                  </div>
                </div>

                {/* Price + Timer */}
                <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/[0.07]' : 'border-gray-100'}`}>
                  <div>
                    <div className={`text-xs line-through ${isDark ? 'text-white/25' : 'text-gray-400'}`}>{d.was}</div>
                    <div className="text-xl font-bold text-[#1956D6]">{d.price}</div>
                    <div className={`text-[11px] ${isDark ? 'text-white/35' : 'text-gray-400'}`}>per person</div>
                  </div>
                  <div className={`text-right text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      <Clock size={11} className="text-red-400" />
                      <span className="text-red-400 font-medium">Ends in</span>
                    </div>
                    <Countdown hours={d.h} />
                  </div>
                </div>

                <button onClick={() => handleBook(d)} className="btn-primary w-full mt-4 py-2.5 text-sm rounded-xl">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo strip */}
        <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl border ${
          isDark ? 'border-white/[0.07] bg-white/[0.03]' : 'border-black/[0.07] bg-white'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C8963A]/15 flex items-center justify-center text-lg shrink-0">🎫</div>
            <div>
              <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                New user? Use code{' '}
                <span className="text-[#1956D6] font-mono font-bold">SKYFLY100</span>
              </span>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                Get ₹100 off on your first booking. Valid for new users only.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText('SKYFLY100')}
            className="shrink-0 px-5 py-2 rounded-xl border-2 border-dashed border-[#1956D6]/40 text-[#1956D6] text-sm font-semibold font-mono hover:bg-[#1956D6]/10 transition-colors"
          >
            SKYFLY100 — Copy
          </button>
        </div>
      </div>
    </section>
  );
}
