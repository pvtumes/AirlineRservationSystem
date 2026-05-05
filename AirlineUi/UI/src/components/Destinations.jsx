import React, { useState } from 'react';
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DESTS = [
  { city:'Dubai',     country:'UAE',         price:'₹18,499', dur:'3h 40m', rating:4.9, tag:'Bestseller', img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&auto=format&fit=crop&q=80' },
  { city:'Singapore', country:'Singapore',   price:'₹22,999', dur:'5h 30m', rating:4.8, tag:'Trending',   img:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=700&auto=format&fit=crop&q=80' },
  { city:'Paris',     country:'France',      price:'₹54,999', dur:'9h 20m', rating:4.9, tag:'Premium',    img:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&auto=format&fit=crop&q=80' },
  { city:'Bali',      country:'Indonesia',   price:'₹28,499', dur:'6h 15m', rating:4.7, tag:'Holiday',    img:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&auto=format&fit=crop&q=80' },
  { city:'Tokyo',     country:'Japan',       price:'₹42,999', dur:'8h 50m', rating:4.8, tag:'New Route',  img:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&auto=format&fit=crop&q=80' },
  { city:'London',    country:'UK',          price:'₹61,499', dur:'10h 10m',rating:4.9, tag:'Business',   img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&auto=format&fit=crop&q=80' },
];

const FILTERS = ['All', 'International', 'Domestic', 'Beach', 'City'];

export default function Destinations() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [active, setActive] = useState('All');

  const handleViewFlights = (dest) => {
    requireAuth(() => {
      navigate('/results', {
        state: { 
          from: 'Mumbai', // Defaulting origin
          to: dest.city, 
          date: new Date().toISOString().split('T')[0], 
          passengers: 1, 
          tripClass: 'economy', 
          tripType: 'one-way' 
        }
      });
    }, 'signin');
  };

  return (
    <section id="destinations" className={`section ${isDark ? 'bg-[#0B1324]' : 'bg-white'}`}>
      <div className="container">

        {/* Header */}
        <div className="max-w-xl mb-12">
          <p className="text-[#1956D6] text-sm font-semibold uppercase tracking-widest mb-3">Destinations</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-1)] tracking-tight">
            Where Do You Want to Go?
          </h2>
          <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Handpicked routes to the world's most extraordinary places.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                active === f
                  ? 'bg-[#1956D6] text-white border-[#1956D6]'
                  : isDark
                    ? 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                    : 'border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTS.map(d => (
            <div key={d.city} className="card overflow-hidden group cursor-pointer">

              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img src={d.img} alt={d.city}
                  className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'}}>
                  {d.tag}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                  <Star size={11} className="text-[#C8963A] fill-[#C8963A]" />
                  <span className="text-white text-xs font-semibold">{d.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-gray-900'} group-hover:text-[#1956D6] transition-colors`}>
                      {d.city}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-[var(--text-3)]" />
                      <span className="text-xs text-[var(--text-2)]">{d.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1956D6]">{d.price}</div>
                    <div className="text-[11px] text-[var(--text-3)] mt-0.5">per person</div>
                  </div>
                </div>

                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? 'border-white/[0.07]' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-1.5 text-[var(--text-2)] text-xs">
                    <Clock size={12} />
                    {d.dur}
                  </div>
                  <button onClick={() => handleViewFlights(d)} className="text-xs font-semibold text-[#1956D6] flex items-center gap-1 group/btn hover:gap-2 transition-all">
                    View Flights <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-outline gap-2">
            View All Destinations <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
