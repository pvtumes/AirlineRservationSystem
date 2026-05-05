import React, { useState } from 'react';
import { Plane, Mail, Phone, MapPin, Send, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FOOTER_LINKS = {
  Company:      ['About Us', 'Careers', 'Press Room', 'Sustainability', 'Investor Relations'],
  Services:     ['Flight Search', 'Manage Booking', 'Online Check-in', 'Baggage Info', 'Special Assistance'],
  Destinations: ['International', 'Domestic', 'New Routes', 'Holiday Packages', 'Beach Getaways'],
  Support:      ['Help Centre', 'Contact Us', 'Refund Policy', 'Terms of Service', 'Privacy Policy'],
};

const SOCIALS = [
  { Icon: FacebookIcon,  label: 'Facebook',  href: '#' },
  { Icon: TwitterIcon,   label: 'Twitter',   href: '#' },
  { Icon: InstagramIcon, label: 'Instagram', href: '#' },
  { Icon: YoutubeIcon,   label: 'YouTube',   href: '#' },
  { Icon: LinkedinIcon,  label: 'LinkedIn',  href: '#' },
];

export default function Footer() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  const submit = e => {
    e.preventDefault();
    if (email) { setDone(true); setEmail(''); setTimeout(() => setDone(false), 4000); }
  };

  const divider = isDark ? 'border-white/[0.07]' : 'border-gray-200';
  const text2    = isDark ? 'text-white/45' : 'text-gray-500';
  const text3    = isDark ? 'text-white/25' : 'text-gray-400';

  return (
    <footer className={isDark ? 'bg-[#040912]' : 'bg-gray-900'}>

      {/* Newsletter */}
      <div className="border-b border-white/[0.07]">
        <div className="container py-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Get Exclusive Deals in Your Inbox</h3>
              <p className="text-white/45 text-sm">Join 2M+ travellers. Flash sales, early access and travel guides — never spam.</p>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[380px]">
              {done ? (
                <div className="px-5 py-3.5 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-sm font-medium">
                  ✓ You're subscribed! Welcome aboard.
                </div>
              ) : (
                <form onSubmit={submit} className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 focus-within:border-[#1956D6]/50 transition-colors">
                    <Mail size={15} className="text-white/30 shrink-0" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Your email address" required
                      className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30" />
                  </div>
                  <button type="submit" className="btn-primary py-3 px-5 rounded-xl text-sm">
                    <Send size={15} /> Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#1956D6] flex items-center justify-center">
                <Plane size={17} className="text-white -rotate-45" />
              </div>
              <div>
                <span className="font-bold text-base text-white">Sky<span className="text-[#1956D6]">Voyage</span></span>
                <span className="block text-[9px] uppercase tracking-[0.18em] text-white/30 font-medium leading-none mt-px">Airlines</span>
              </div>
            </div>

            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Connecting hearts across continents since 2009. Fly with confidence, arrive with joy.
            </p>

            <div className="space-y-2.5 mb-7">
              {[
                { Icon: Phone,  text: '+91 1800-SKY-VOYAGE' },
                { Icon: Mail,   text: 'support@skyvoyage.com' },
                { Icon: MapPin, text: 'SkyVoyage Tower, BKC, Mumbai 400051' },
              ].map(c => (
                <div key={c.text} className="flex items-start gap-2.5 text-white/40 text-sm">
                  <c.Icon size={14} className="text-[#1956D6] mt-0.5 shrink-0" />
                  <span>{c.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.07] flex items-center justify-center text-white/40 hover:text-white hover:bg-[#1956D6] hover:border-[#1956D6] transition-all duration-200">
                  <s.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat} className="lg:col-span-1">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">{cat}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-white/40 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1 group">
                      <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 text-[#1956D6] transition-opacity" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App download */}
        <div className="mt-12 pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <div className="text-white text-sm font-semibold">Download SkyVoyage App</div>
            <div className="text-white/35 text-xs mt-0.5">Book and check-in from anywhere.</div>
          </div>
          <div className="flex gap-2.5">
            {['🍎 App Store', '🤖 Google Play'].map(a => (
              <button key={a} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-xs font-medium hover:bg-white/[0.10] transition-colors">
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="mt-6 flex flex-wrap gap-3">
          {['🏆 Best Airline 2025 — Skytrax', '⭐ 5-Star Safety — IATA', '🌿 Green Aviation 2024', '📱 Best App — AppStore India'].map(a => (
            <span key={a} className="text-[11px] text-white/25 border border-white/[0.06] px-3 py-1 rounded-full">{a}</span>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} SkyVoyage Airlines Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-xs text-white/25">
            {['Privacy Policy', 'Terms of Use', 'Cookie Settings', 'Sitemap'].map(l => (
              <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
