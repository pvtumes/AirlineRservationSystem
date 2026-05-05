import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authMode, setAuthMode] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skyVoyageUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  /**
   * Persist any user object (from login OR register API response).
   * Accepts the full server user shape:
   *   { id, name, email, tier, loyalty_points, avatar_url, ... }
   */
  const login = (userData) => {
    const profile = typeof userData === 'string'
      ? { name: userData, email: '' }
      : userData;
    setUser(profile);
    localStorage.setItem('skyVoyageUser', JSON.stringify(profile));

    // Execute pending action after login
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const requireAuth = (action, mode = 'signin') => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthMode(mode);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skyVoyageUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authMode, setAuthMode, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

