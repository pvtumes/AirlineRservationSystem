/**
 * userService.js
 *
 * Service layer for all user profile operations.
 * LocalStorage + API integration (non-breaking)
 */

import { DEFAULT_USER_PROFILE } from '../data/user.js';
import { DEFAULT_PASSENGERS } from '../data/passengers.js';

const PROFILE_KEY = 'sv_user_profile';
const PASSENGERS_KEY = 'sv_passengers';

/* 🔥 API BASE — proxied via Vite to avoid CORS (see vite.config.js /user-api) */
const USER_API_BASE = '/user-api';

/* ── Helpers ────────────────────────────────────────────── */
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch { /* ignore */ }
}

function delay(ms = 300) {
  return new Promise(r => setTimeout(r, ms));
}

function uid() {
  return `PAX-${Date.now().toString(36).toUpperCase()}`;
}

/* ═══════════════════════════════════════════════════════════
   USER PROFILE CRUD
═══════════════════════════════════════════════════════════ */

/**
 * Get user profile
 */
export async function getUser(authUser = null) {
  await delay(200);

  const stored = load(PROFILE_KEY, null);
  if (stored) return stored;

  const seeded = {
    ...DEFAULT_USER_PROFILE,
    ...(authUser ? { name: authUser.name ?? '', email: authUser.email ?? '' } : {}),
  };

  save(PROFILE_KEY, seeded);
  return seeded;
}

/**
 * Update user profile (LOCAL + API)
 */
export async function updateUser(updates) {
  await delay(400);

  const current = load(PROFILE_KEY, DEFAULT_USER_PROFILE);

  const merged = {
    ...current,
    ...updates,
    preferences: {
      ...current.preferences,
      ...(updates.preferences ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };

  /* ✅ SAVE LOCALLY FIRST */
  save(PROFILE_KEY, merged);

  /* ───────── API INTEGRATION ───────── */
  try {
    const user_id = merged.user_id || 'U103';

    /* ✅ CONTACT API */
    if (updates.email || updates.phone || updates.home_city) {
      await fetch(`${USER_API_BASE}/updation_contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: merged.email,
          phone: merged.phone,
          home_city: merged.home_city,
          user_id
        })
      });
    }

    /* ✅ PROFILE API */
    if (updates.name || updates.gender || updates.dob || updates.nationality) {
      await fetch(`${USER_API_BASE}/updation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: merged.name,
          gender: merged.gender,
          dob: merged.dob,
          nationality: merged.nationality,
          user_id
        })
      });
    }

  } catch (err) {
    console.error('❌ API update failed:', err);
    // ❗ No throw → app still works
  }

  return merged;
}

/**
 * Upload avatar (base64)
 */
export async function uploadAvatar(file) {
  await delay(600);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      await updateUser({ avatar: dataUrl });
      resolve(dataUrl);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ═══════════════════════════════════════════════════════════
   PASSENGERS CRUD
═══════════════════════════════════════════════════════════ */

export async function getPassengers() {
  await delay(150);
  return load(PASSENGERS_KEY, DEFAULT_PASSENGERS);
}

export async function addPassenger(data) {
  await delay(300);

  const all = load(PASSENGERS_KEY, DEFAULT_PASSENGERS);

  const passenger = {
    ...data,
    id: uid(),
    createdAt: new Date().toISOString()
  };

  save(PASSENGERS_KEY, [...all, passenger]);
  return passenger;
}

export async function updatePassenger(id, updates) {
  await delay(300);

  const all = load(PASSENGERS_KEY, DEFAULT_PASSENGERS);

  const next = all.map(p =>
    p.id === id
      ? { ...p, ...updates, updatedAt: new Date().toISOString() }
      : p
  );

  save(PASSENGERS_KEY, next);
  return next.find(p => p.id === id);
}

export async function deletePassenger(id) {
  await delay(200);

  const all = load(PASSENGERS_KEY, DEFAULT_PASSENGERS);
  const next = all.filter(p => p.id !== id);

  save(PASSENGERS_KEY, next);
}

/**
 * Bulk save passengers — localStorage first, then API.
 * Surfaces 4xx validation errors; silently falls back on network errors.
 */
export async function bulkSavePassengers(userId = 'U103', passengers = []) {
  if (!passengers.length) throw new Error('At least one passenger is required.');

  /* ── 1. Save locally first (always works) ── */
  const all = load(PASSENGERS_KEY, DEFAULT_PASSENGERS);
  const newLocal = passengers.map(p => ({
    ...p,
    age: p.age ? Number(p.age) : undefined,
    id: uid(),
    createdAt: new Date().toISOString(),
  }));
  save(PASSENGERS_KEY, [...all, ...newLocal]);

  /* ── 2. Call bulk API ── */
  try {
    const res = await fetch('/new-booking-api/api/saved-passengers/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, passengers }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error || `Failed to save passengers (HTTP ${res.status})`;

      /* 400 validation errors → surface to user */
      if (res.status === 400) {
        const e = new Error(msg);
        e.isApiError = true;
        throw e;
      }
      console.warn('Bulk save API error (local save succeeded):', msg);
    } else {
      const data = await res.json();
      console.info('✅ Bulk passengers saved via API:', data);
      return { ...data, localPassengers: newLocal };
    }
  } catch (err) {
    if (err.isApiError) throw err;            // re-throw 400 to UI
    console.warn('Bulk save API unreachable — local save succeeded:', err.message);
  }

  return {
    success: true,
    message: 'Passengers saved locally',
    savedCount: newLocal.length,
    localPassengers: newLocal,
  };
}

/* ═══════════════════════════════════════════════════════════
   VALIDATION HELPERS
═══════════════════════════════════════════════════════════ */

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validatePhone(phone) {
  return /^[\+]?[\d\s\-\(\)]{7,15}$/.test(phone.trim());
}

export function validateName(name) {
  return name.trim().length >= 2;
}

export function validateDob(dob) {
  if (!dob) return false;

  const d = new Date(dob);
  const now = new Date();

  const minAge = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  return d < minAge;
}