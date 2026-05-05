/**
 * UserProfileContext.jsx
 *
 * Provides enriched user profile state + all CRUD actions to the tree.
 * Delegates all persistence to userService (never touches localStorage directly).
 */
import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getUser, updateUser, uploadAvatar,
  getPassengers, addPassenger, updatePassenger, deletePassenger,
  bulkSavePassengers,
} from '../services/userService';

const UserProfileContext = createContext();

export function UserProfileProvider({ children }) {
  const { user: authUser, login } = useAuth();

  const [profile,    setProfile]    = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [passengerLoading, setPassengerLoading] = useState(true);

  /* ── Load on mount / auth change ── */
  useEffect(() => {
    if (!authUser) { setProfile(null); setProfileLoading(false); return; }

    setProfileLoading(true);
    getUser(authUser)
      .then(p => setProfile(p))
      .finally(() => setProfileLoading(false));

    setPassengerLoading(true);
    getPassengers()
      .then(p => setPassengers(p))
      .finally(() => setPassengerLoading(false));
  }, [authUser?.email]); // re-load if user switches

  /* ── Sync AuthContext name/email when profile updates ── */
  const syncAuth = useCallback((updated) => {
    if (authUser && (updated.name !== authUser.name || updated.email !== authUser.email)) {
      login({ ...authUser, name: updated.name, email: updated.email });
    }
  }, [authUser, login]);

  /* ── Profile actions ── */
  const saveProfile = useCallback(async (updates) => {
    const updated = await updateUser(updates);
    setProfile(updated);
    syncAuth(updated);
    return updated;
  }, [syncAuth]);

  const saveAvatar = useCallback(async (file) => {
    const url     = await uploadAvatar(file);
    setProfile(p  => p ? { ...p, avatar: url } : p);
    return url;
  }, []);

  /* ── Passenger actions ── */
  const addPax = useCallback(async (data) => {
    const pax = await addPassenger(data);
    setPassengers(prev => [...prev, pax]);
    return pax;
  }, []);

  const editPax = useCallback(async (id, updates) => {
    const pax = await updatePassenger(id, updates);
    setPassengers(prev => prev.map(p => p.id === id ? pax : p));
    return pax;
  }, []);

  const removePax = useCallback(async (id) => {
    await deletePassenger(id);
    setPassengers(prev => prev.filter(p => p.id !== id));
  }, []);

  const bulkAddPax = useCallback(async (userId, newPassengers) => {
    const result = await bulkSavePassengers(userId, newPassengers);
    // Append all newly created local passengers to state
    setPassengers(prev => [...prev, ...result.localPassengers]);
    return result;
  }, []);

  return (
    <UserProfileContext.Provider value={{
      profile, profileLoading,
      passengers, passengerLoading,
      saveProfile, saveAvatar,
      addPax, editPax, removePax, bulkAddPax,
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserProfileContext);
