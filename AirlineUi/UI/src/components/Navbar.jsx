import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Plane } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Search',       href: '#search' },
  { label: 'Deals',        href: '#deals' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'About',        href: '#about' },
];

export default function Navbar({ onSignIn, onSignUp }) {
  const { isDark, setIsDark } = useTheme();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [active, setActive]       = useState('#home');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navBg = scrolled
    ? isDark
      ? 'bg-[#060B17]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.06)]'
      : 'bg-white/95 backdrop-blur-2xl border-b border-black/[0.06] shadow-sm'
    : 'bg-transparent';

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${navBg}`} role="navigation">
      <div className="container">
        <div className="flex items-center h-[72px]">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 flex-shrink-0 group" onClick={() => setActive('#home')}>
            <div className="w-9 h-9 rounded-xl bg-[#1956D6] flex items-center justify-center shadow-lg shadow-[#1956D6]/30 group-hover:shadow-[#1956D6]/50 transition-shadow duration-300">
              <Plane size={18} className="text-white -rotate-45" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-[17px] tracking-tight text-[var(--text-1)]">
                Sky<span className="text-[#1956D6]">Voyage</span>
              </span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-[var(--text-3)] font-medium leading-none mt-px">
                Airlines
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 ml-12">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setActive(l.href)}
                className={`nav-link text-sm font-medium transition-colors duration-200 ${
                  active === l.href ? 'text-[#1956D6] active' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              id="theme-toggle"
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-alt)] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>

            <button
              id="signin-btn"
              onClick={onSignIn}
              className="btn-outline text-sm py-2.5 px-5"
            >
              Sign In
            </button>

            <button
              id="signup-btn"
              onClick={onSignUp}
              className="btn-primary text-sm py-2.5 px-5"
            >
              Get Started
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-2)]"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-1)]"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden overflow-hidden transition-all duration-350 ${
        menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
      } ${isDark ? 'bg-[#060B17]/98' : 'bg-white/98'} backdrop-blur-2xl border-t border-[var(--border)]`}>
        <div className="container py-5 space-y-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => { setActive(l.href); setMenuOpen(false); }}
              className="flex items-center h-11 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors border-b border-[var(--border)] last:border-0"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            <button onClick={() => { onSignIn(); setMenuOpen(false); }} className="btn-outline flex-1 text-sm py-2.5">Sign In</button>
            <button onClick={() => { onSignUp(); setMenuOpen(false); }} className="btn-primary flex-1 text-sm py-2.5">Get Started</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
