import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VALUES = [
  'Punctuality above all — we respect your time',
  'Transparent pricing — no hidden fees, ever',
  'Sustainability-driven fleet and operations',
  'World-class passenger safety standards',
];

const STATS = [
  { n: '200+', l: 'Destinations', sub: 'across 6 continents' },
  { n: '50M+', l: 'Passengers',   sub: 'flown since 2009' },
  { n: '98%',  l: 'On-Time Rate', sub: 'industry-leading' },
  { n: '48',   l: 'Awards',       sub: 'incl. Skytrax 2025' },
];

export default function About() {
  const { isDark } = useTheme();
  return (
    <section id="about" className={`section ${isDark ? 'bg-[#0B1324]' : 'bg-white'}`}>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* Images */}
          <div className="relative order-last lg:order-first">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-52 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&auto=format&fit=crop&q=80"
                    alt="Aircraft at sunset" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden h-36 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&auto=format&fit=crop&q=80"
                    alt="Airport terminal" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden h-40 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&auto=format&fit=crop&q=80"
                    alt="Inflight service" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden h-52 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&auto=format&fit=crop&q=80"
                    alt="Beautiful destination" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:-right-4 sm:translate-x-0 sm:bottom-6 px-5 py-4 rounded-2xl shadow-2xl"
              style={{background: 'linear-gradient(135deg, #1956D6, #1448BE)'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-xs text-white/70 mt-0.5">On-Time Departure</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-[#1956D6] text-sm font-semibold uppercase tracking-widest mb-4">About Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-1)] tracking-tight leading-tight mb-6">
              Flying Dreams<br />
              <span className="gold-text">Since 2009</span>
            </h2>

            <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              SkyVoyage was founded with one belief: <strong className={isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>travel should be joyful, not stressful.</strong> Over 15 years, we've grown from a domestic carrier into a global airline connecting millions of passengers to 200+ destinations across 6 continents.
            </p>

            <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
              We combine cutting-edge booking technology with warm, personalised service to deliver an experience that feels premium at every price point.
            </p>

            {/* Values */}
            <div className="space-y-3 mb-10">
              {VALUES.map(v => (
                <div key={v} className="flex items-start gap-3">
                  <CheckCircle size={17} className="text-[#1956D6] mt-0.5 shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-white/65' : 'text-gray-600'}`}>{v}</span>
                </div>
              ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map(s => (
                <div key={s.l} className={`p-4 rounded-2xl border ${isDark ? 'border-white/[0.07] bg-white/[0.03]' : 'border-black/[0.07] bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.n}</div>
                  <div className="text-sm font-semibold text-[#1956D6] mt-0.5">{s.l}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
