import React, { useState } from 'react';
import { Eye, EyeOff, Plane, X, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser } from '../services/authService';

/* ── Reusable input row ──────────────────────────────────── */
const Field = ({ icon: Icon, type = 'text', placeholder, value, onChange, right, isDark }) => {
  const fieldClass = isDark
    ? 'bg-white/[0.04] border-white/[0.09]'
    : 'bg-gray-50 border-black/[0.08]';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-200
        ${fieldClass} focus-within:border-[#1956D6]/50 focus-within:ring-2 focus-within:ring-[#1956D6]/10`}
    >
      <Icon size={15} className="text-[#1956D6] shrink-0" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`flex-1 bg-transparent outline-none text-sm ${textClass} placeholder-[var(--text-3)]`}
      />
      {right}
    </div>
  );
};

/* ── Spinner ─────────────────────────────────────────────── */
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   AuthModal
═══════════════════════════════════════════════════════════ */
export default function AuthModal({ mode, onClose, onSwitch }) {
  const { isDark }            = useTheme();
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm]       = useState({
    name: '', userId: '', email: '', password: '',
  });

  const isLogin = mode === 'signin';

  /* ── Submit ──────────────────────────────────────────── */
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        /* ── LOGIN ───────────────────────────────────────── */
        const result = await loginUser({
          email:    form.email,
          password: form.password,
        });

        if (result.success) {
          const u = result.user ?? {};
          login({
            id:             u.id             ?? '',
            name:           u.name           ?? form.email.split('@')[0] ?? 'Traveller',
            email:          u.email          ?? form.email,
            phone:          u.phone          ?? '',
            tier:           u.tier           ?? '',
            loyalty_points: u.loyalty_points ?? 0,
            avatar_url:     u.avatar_url     ?? '',
            created_at:     u.created_at     ?? '',
          });
          setSuccess(true);
          setTimeout(() => { onClose(); navigate('/dashboard'); }, 1400);
        } else {
          // spec: success === false → show this exact message
          setError('User does not exist or password is incorrect');
        }

      } else {
        /* ── REGISTER ────────────────────────────────────── */
        const result = await registerUser({
          name:     form.name,
          userid:   form.userId,   // API field name is "userid"
          email:    form.email,
          password: form.password,
        });

        if (result.success) {
          const u = result.user ?? {};
          login({
            id:        u.id        ?? form.userId,
            name:      u.name      ?? form.name,
            email:     u.email     ?? form.email,
            tier:      u.tier      ?? '',
            createdAt: u.createdAt ?? '',
          });
          setSuccess(true);
          setTimeout(() => { onClose(); navigate('/dashboard'); }, 1400);
        } else {
          // spec: success === false → show this exact message
          setError('User ID or Email already exists');
        }
      }
    } catch {
      // Network / JSON parse error
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Styles ──────────────────────────────────────────── */
  const bg    = isDark ? '#060B17' : '#FFFFFF';
  const text1 = isDark ? 'text-white'      : 'text-gray-900';
  const text2 = isDark ? 'text-white/50'   : 'text-gray-500';
  const text3 = isDark ? 'text-white/25'   : 'text-gray-400';

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" onClick={onClose} />

      <div
        className="relative w-full max-w-[420px] rounded-2xl border shadow-2xl"
        style={{
          background:   bg,
          borderColor:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 rounded-t-2xl bg-[#1956D6]" />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 w-8 h-8 rounded-lg flex items-center justify-center transition-all
              ${isDark
                ? 'text-white/40 hover:bg-white/[0.06] hover:text-white'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <X size={16} />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 mb-7">
            <div className="w-8 h-8 rounded-lg bg-[#1956D6] flex items-center justify-center">
              <Plane size={15} className="text-white -rotate-45" />
            </div>
            <span className={`font-bold ${text1}`}>
              Sky<span className="text-[#1956D6]">Voyage</span>
            </span>
          </div>

          <h2 className={`text-xl font-bold mb-1 ${text1}`}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className={`text-sm mb-6 ${text2}`}>
            {isLogin
              ? 'Sign in to access your bookings and deals.'
              : 'Join millions of travellers on SkyVoyage.'}
          </p>

          {/* ── Success state ──────────────────────────── */}
          {success ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={30} className="text-green-500" />
              </div>
              <p className={`font-semibold ${text1}`}>
                {isLogin ? 'Signed in!' : 'Account created!'}
              </p>
              <p className={`text-sm ${text2}`}>Redirecting…</p>
            </div>

          ) : (
            /* ── Form ──────────────────────────────────── */
            <form onSubmit={onSubmit} className="space-y-3">

              {/* Sign-up only fields */}
              {!isLogin && (
                <>
                  <Field
                    isDark={isDark} icon={User}
                    placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                  <Field
                    isDark={isDark} icon={User}
                    placeholder="User ID (e.g. U004)"
                    value={form.userId}
                    onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}
                  />
                </>
              )}

              {/* Email */}
              <Field
                isDark={isDark} icon={Mail} type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />

              {/* Password */}
              <Field
                isDark={isDark} icon={Lock}
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className={`${text3} transition-colors`}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25">
                  <span className="text-[#FF6B6B] text-xs leading-relaxed">{error}</span>
                </div>
              )}

              {/* Forgot password (login only) */}
              {isLogin && (
                <div className="flex justify-end pt-0.5">
                  <a href="#" className="text-xs text-[#1956D6] hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl text-sm mt-2 gap-2
                           flex items-center justify-center
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    {isLogin ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full h-px ${isDark ? 'bg-white/[0.07]' : 'bg-gray-200'}`} />
                </div>
                <div className="relative flex justify-center">
                  <span
                    className={`px-3 text-xs ${text3}`}
                    style={{ background: bg }}
                  >
                    or continue with
                  </span>
                </div>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                {['Google', 'Apple'].map(s => (
                  <button
                    key={s} type="button"
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border
                      text-sm font-medium transition-all hover:scale-[1.02]
                      ${isDark
                        ? `border-white/[0.08] ${text2} hover:bg-white/[0.04]`
                        : 'border-black/[0.08] text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s === 'Google' ? '🇬' : '🍎'} {s}
                  </button>
                ))}
              </div>

              {/* Switch mode */}
              <p className={`text-center text-sm pt-1 ${text2}`}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={onSwitch}
                  className="text-[#1956D6] font-semibold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
