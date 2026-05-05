/**
 * WishlistContext.jsx
 * Persists saved flights + price alerts in localStorage.
 * Provides a global wishlist accessible across the app.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext();

const STORAGE_KEY  = 'sv_wishlist';
const ALERTS_KEY   = 'sv_price_alerts';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function WishlistProvider({ children }) {
  const [wishlist,     setWishlist]     = useState(() => load(STORAGE_KEY, []));
  const [priceAlerts,  setPriceAlerts]  = useState(() => load(ALERTS_KEY, []));

  const save = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* noop */ }
  };

  /** Toggle a flight in/out of the wishlist */
  const toggleWishlist = useCallback((flight) => {
    setWishlist(prev => {
      const exists = prev.some(f => f.id === flight.id);
      const next   = exists ? prev.filter(f => f.id !== flight.id) : [...prev, flight];
      save(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback((id) => wishlist.some(f => f.id === id), [wishlist]);

  /** Add a price alert for a route */
  const addPriceAlert = useCallback(({ from, to, targetPrice }) => {
    const alert = {
      id:          `AL-${Date.now()}`,
      from, to, targetPrice,
      createdAt:   new Date().toISOString(),
      status:      'active',
    };
    setPriceAlerts(prev => {
      const next = [...prev, alert];
      save(ALERTS_KEY, next);
      return next;
    });
    return alert;
  }, []);

  const removePriceAlert = useCallback((id) => {
    setPriceAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      save(ALERTS_KEY, next);
      return next;
    });
  }, []);

  return (
    <WishlistContext.Provider value={{
      wishlist, toggleWishlist, isWishlisted,
      priceAlerts, addPriceAlert, removePriceAlert,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
