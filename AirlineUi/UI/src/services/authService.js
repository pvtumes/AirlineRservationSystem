/**
 * authService.js
 *
 * Handles Register and Login API calls for SkyVoyage.
 *
 * Backend (TIBCO BW):
 *   POST http://Umesh:8085/accountcreationapi
 *   POST http://Umesh:8085/userloginapi
 *
 * During development:
 *   /api/* → proxied by Vite to http://localhost:8085
 */

const BASE_URL = '/api';

/* ── Register ───────────────────────────────────────────── */
export async function registerUser({ name, userid, email, password }) {
  const res = await fetch(`${BASE_URL}/accountcreationapi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, userid, email, password }),
  });

  // ✅ Handle gateway / backend failures (502, 500, etc.)
  if (!res.ok) {
    return {
      success: false,
      message: 'Server error. Please try again later.',
    };
  }

  const data = await res.json();

  if (data.success === true) {
    return { success: true, user: data.user ?? null };
  }

  return {
    success: false,
    message: 'User ID or Email already exists',
  };
}

/* ── Login ──────────────────────────────────────────────── */
export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/userloginapi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // ✅ Handle gateway / backend failures
  if (!res.ok) {
    return {
      success: false,
      message: 'Server error. Please try again later.',
    };
  }

  const data = await res.json();

  if (data.success === true) {
    return { success: true, user: data.user ?? null };
  }

  return {
    success: false,
    message: 'User does not exist or password is incorrect',
  };
}