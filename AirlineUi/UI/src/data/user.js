/**
 * user.js — Default user profile structure.
 *
 * This is the seed data used when no saved profile exists in localStorage.
 * Replace this with a real API response later by updating userService.getUser().
 */

export const DEFAULT_USER_PROFILE = {
  id:          'USR-001',
  name:        '',
  gender:      '',
  dob:         '',
  city:        '',
  nationality: 'Indian',

  // Contact
  email:       '',
  phone:       '',

  // Travel preferences
  preferences: {
    seat:          'window',   // 'window' | 'aisle' | 'middle'
    meal:          'veg',      // 'veg' | 'nonveg' | 'vegan' | 'none'
    notifications: true,
    currency:      'INR',
  },

  // Loyalty
  frequentFlyer: '',
  tier:          'silver',    // 'silver' | 'gold' | 'platinum'

  // Avatar (base64 or URL; null means use initials)
  avatar: null,

  createdAt: new Date().toISOString(),
};

export const GENDERS   = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
export const SEAT_PREFS = ['window', 'aisle', 'middle'];
export const MEAL_PREFS = [
  { value: 'veg',    label: 'Vegetarian' },
  { value: 'nonveg', label: 'Non-Vegetarian' },
  { value: 'vegan',  label: 'Vegan' },
  { value: 'none',   label: 'No preference' },
];
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
