import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const REVIEWS = [
  { name:'Priya Sharma',   role:'Frequent Flyer',       city:'Mumbai',    stars:5, avatar:'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&auto=format&fit=crop&q=80', text:'SkyVoyage redefines airline travel. The app is flawless, the cabin crew genuinely caring, and I always arrive on time. Mumbai to Dubai felt like business class even in economy.', route:'Mumbai → Dubai' },
  { name:'Rahul Mehta',    role:'Business Executive',   city:'Bangalore', stars:5, avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', text:"I fly 3–4 times a month. SkyVoyage's flight recommendation engine saved me ₹12,000 last quarter alone. The Wi-Fi is fast enough for video calls — that alone sets them apart.", route:'BLR → Singapore' },
  { name:'Neha Kapoor',    role:'Travel Blogger',       city:'Delhi',     stars:5, avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80', text:"I've reviewed 200+ airlines and SkyVoyage is genuinely exceptional. The seat picker, meal customisation, instant confirmation — every detail is premium. My readers absolutely love it.", route:'Delhi → London' },
  { name:'Arjun Verma',    role:'Software Engineer',    city:'Pune',      stars:5, avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', text:'The tech is seriously impressive — real-time availability, smart recommendations, instant refunds. As an engineer I notice these things. Plus, the flights themselves are excellent.', route:'Pune → Tokyo' },
  { name:'Ananya Pillai',  role:'Student',              city:'Chennai',   stars:5, avatar:'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=120&auto=format&fit=crop&q=80', text:'My first international trip and SkyVoyage made everything stress-free. Student discounts, easy meal selection, friendly support. I\'ll never fly anyone else.', route:'Chennai → Bali' },
];

export default function Testimonials() {
  const { isDark } = useTheme();
  const [cur, setCur] = useState(0);

  const prev = () => setCur(c => (c - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setCur(c => (c + 1) % REVIEWS.length);

  const triple = [-1, 0, 1].map(o => REVIEWS[(cur + o + REVIEWS.length) % REVIEWS.length]);

  return (
    <section className={`section ${isDark ? 'bg-[#060B17]' : 'bg-[#F4F7FF]'}`}>
      <div className="container">

        {/* Header */}
        <div className="max-w-xl mx-auto text-center mb-16">
          <p className="text-[#1956D6] text-sm font-semibold uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-1)] tracking-tight">
            Loved by Millions of Travellers
          </h2>
          <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Real stories from real passengers.
          </p>
        </div>

        {/* Cards */}
        <div className="hidden md:grid grid-cols-3 gap-6 items-start">
          {triple.map((r, i) => (
            <div key={r.name} className={`transition-all duration-300 ${i === 1 ? 'scale-100' : 'scale-95 opacity-55'}`}>
              <ReviewCard r={r} isDark={isDark} featured={i === 1} />
            </div>
          ))}
        </div>
        <div className="md:hidden">
          <ReviewCard r={REVIEWS[cur]} isDark={isDark} featured />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={prev} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105 ${
            isDark ? 'border-white/10 text-white/50 hover:border-[#1956D6]/50 hover:text-[#1956D6]' : 'border-gray-200 text-gray-400 hover:border-[#1956D6] hover:text-[#1956D6]'
          }`}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setCur(i)}
                className={`rounded-full transition-all duration-300 ${i === cur ? 'w-6 h-2 bg-[#1956D6]' : 'w-2 h-2 bg-gray-400/30'}`}
              />
            ))}
          </div>
          <button onClick={next} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105 ${
            isDark ? 'border-white/10 text-white/50 hover:border-[#1956D6]/50 hover:text-[#1956D6]' : 'border-gray-200 text-gray-400 hover:border-[#1956D6] hover:text-[#1956D6]'
          }`}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Trust badges */}
        <div className={`mt-16 pt-10 border-t flex flex-wrap justify-center gap-12 ${isDark ? 'border-white/[0.07]' : 'border-gray-200'}`}>
          {[{ l:'Trustpilot', v:'4.9/5' }, { l:'Google Reviews', v:'4.8/5' }, { l:'App Store', v:'4.9/5' }].map(b => (
            <div key={b.l} className="text-center">
              <div className="flex justify-center gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-[#C8963A] fill-[#C8963A]" />)}
              </div>
              <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{b.v}</div>
              <div className={`text-xs ${isDark ? 'text-white/35' : 'text-gray-400'}`}>{b.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ r, isDark, featured }) {
  return (
    <div className={`relative p-6 rounded-2xl border ${
      featured
        ? isDark ? 'border-[#1956D6]/20 bg-[#0F1929] shadow-xl shadow-black/30' : 'border-[#1956D6]/15 bg-white shadow-xl shadow-black/[0.08]'
        : isDark ? 'border-white/[0.06] bg-white/[0.03]' : 'border-gray-200 bg-gray-50'
    }`}>
      {/* Quote */}
      <div className="w-8 h-8 rounded-lg bg-[#1956D6]/10 flex items-center justify-center mb-4">
        <Quote size={14} className="text-[#1956D6]" />
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(r.stars)].map((_, i) => <Star key={i} size={13} className="text-[#C8963A] fill-[#C8963A]" />)}
      </div>

      <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-white/65' : 'text-gray-600'}`}>"{r.text}"</p>

      <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/[0.07]' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.name}</div>
            <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{r.role} · {r.city}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-[#1956D6]">{r.route}</div>
        </div>
      </div>
    </div>
  );
}
