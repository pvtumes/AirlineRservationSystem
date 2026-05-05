import React from 'react';
import { Shield, Wifi, Utensils, Headphones, Zap, Award, Clock, Leaf } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: Shield,      title: 'Safety First',         desc: 'Industry-leading safety with real-time monitoring and certified maintenance across every aircraft in our fleet.' },
  { icon: Wifi,        title: 'In-Flight Wi-Fi',       desc: 'Blazing-fast satellite internet on all routes. Stream, work, or browse without interruption at altitude.' },
  { icon: Utensils,    title: 'Gourmet Dining',        desc: 'Chef-curated menus with vegetarian, non-vegetarian, Jain, and vegan options. Customise at booking.' },
  { icon: Headphones,  title: '24/7 Support',          desc: 'Round-the-clock assistance via chat, call, or email. A real human is always here to help you.' },
  { icon: Zap,         title: 'Fast Boarding',         desc: 'Digital passes and smart gate tech get you onboard 40% faster than the industry average.' },
  { icon: Award,       title: 'Loyalty Rewards',       desc: 'Earn SkyMiles on every flight. Redeem for upgrades, free flights, hotels, and exclusive lounge access.' },
  { icon: Clock,       title: 'On-Time Promise',       desc: '98% on-time departures. Automatic compensation for any delay over 30 minutes, no questions asked.' },
  { icon: Leaf,        title: 'Carbon Neutral',        desc: 'We plant a tree for every ticket booked and use fuel-efficient aircraft to reduce our carbon footprint.' },
];

export default function Services() {
  const { isDark } = useTheme();
  return (
    <section id="services" className={`section ${isDark ? 'bg-[#060B17]' : 'bg-[#F4F7FF]'}`}>
      <div className="container">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-[#1956D6] text-sm font-semibold uppercase tracking-widest mb-3">Why SkyVoyage</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-1)] tracking-tight">
            Built for the Modern Traveller
          </h2>
          <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Every detail engineered to make your journey seamless, comfortable, and worth remembering.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className={`group p-6 rounded-2xl border transition-all duration-250 hover:-translate-y-1 ${
                isDark
                  ? 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'
                  : 'border-black/[0.06] bg-white hover:shadow-lg hover:shadow-black/[0.06]'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-[#1956D6]/10 flex items-center justify-center mb-4 group-hover:bg-[#1956D6]/20 transition-colors">
                <f.icon size={20} className="text-[#1956D6]" />
              </div>
              <h3 className={`font-semibold text-base mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/45' : 'text-gray-500'}`}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 relative rounded-3xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0D2E8C 0%, #1956D6 50%, #1448BE 100%)'
        }}>
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage: 'radial-gradient(circle at 80% 50%, #C8963A 0%, transparent 60%)'}} />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-12">
            <div>
              <div className="text-[#C8963A] text-xs font-semibold uppercase tracking-widest mb-2">SkyVoyage Premium</div>
              <h3 className="text-3xl font-bold text-white mb-2">Unlock a Better Journey</h3>
              <p className="text-white/60 max-w-md text-sm leading-relaxed">
                Priority boarding, lounge access, 3× SkyMiles, and unlimited entertainment — for just ₹2,999/year.
              </p>
            </div>
            <button className="shrink-0 px-8 py-3.5 rounded-xl bg-white text-[#1956D6] font-bold text-sm hover:bg-blue-50 transition-colors shadow-xl whitespace-nowrap">
              Explore Premium →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
