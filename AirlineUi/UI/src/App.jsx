import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider }  from './context/WishlistContext';
import { UserProfileProvider } from './context/UserProfileContext';
import Navbar               from './components/Navbar';
import Hero                 from './components/Hero';
import Deals                from './components/Deals';
import Destinations         from './components/Destinations';
import Services             from './components/Services';
import About                from './components/About';
import Testimonials         from './components/Testimonials';
import Footer               from './components/Footer';
import AuthModal            from './components/AuthModal';
import Dashboard            from './pages/Dashboard';
import SearchResults        from './pages/SearchResults';
import BookingPage          from './pages/BookingPage';
import MyBookings           from './pages/MyBookings';
import ProfilePage          from './pages/ProfilePage';
import CheckinPage          from './pages/CheckinPage';
import FlightStatusPage     from './pages/FlightStatusPage';

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-6 z-40 w-10 h-10 rounded-full bg-[#1956D6] text-white flex items-center justify-center shadow-lg hover:bg-[#1448BE] hover:scale-110 transition-all duration-200"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

/* ── Landing page ─────────────────────────────────────── */
function LandingPage({ onSignIn, onSignUp }) {
  return (
    <>
      <Navbar onSignIn={onSignIn} onSignUp={onSignUp} />
      <main>
        <Hero />
        <Deals />
        <Destinations />
        <Services />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

/* ── App content with routing ─────────────────────────── */
function AppContent() {
  const { isDark } = useTheme();
  const { authMode, setAuthMode, user, requireAuth } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, auth buttons go straight to dashboard
  const handleSignIn = () => user ? navigate('/dashboard') : setAuthMode('signin');
  const handleSignUp = () => user ? navigate('/dashboard') : setAuthMode('signup');

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-1)', transition: 'background 0.35s ease, color 0.35s ease' }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: isDark ? '#0F1929' : '#fff',
          color: isDark ? '#EEF2FF' : '#0A1628',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
        }
      }} />

      <Routes>
        <Route path="/" element={
          <>
            <LandingPage
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
            />
            <ScrollTop />
          </>
        } />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/results"        element={<SearchResults />} />
        <Route path="/booking/:id"    element={<BookingPage />} />
        <Route path="/my-bookings"    element={<MyBookings />} />
        <Route path="/profile"        element={<ProfilePage />} />
        <Route path="/checkin"        element={<CheckinPage />} />
        <Route path="/flight-status"  element={<FlightStatusPage />} />
      </Routes>
      
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode(p => p === 'signin' ? 'signup' : 'signin')}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProfileProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
