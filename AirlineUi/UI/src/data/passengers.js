/**
 * passengers.js — Default saved passengers seed data.
 *
 * Each passenger object is reusable in the booking flow.
 * Fields intentionally match the booking form's passenger schema.
 */

export const DEFAULT_PASSENGERS = [
  {
    id:       'PAX-001',
    name:     'Priya Sharma',
    email:    'priya@example.com',
    phone:    '+91 98765 00001',
    age:      28,
    gender:   'Female',
    relation: 'Spouse',
    dob:      '1997-03-12',
  },
  {
    id:       'PAX-002',
    name:     'Aryan Sharma',
    email:    '',
    phone:    '',
    age:      8,
    gender:   'Male',
    relation: 'Child',
    dob:      '2016-11-05',
  },
];

export const RELATIONS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Colleague', 'Other'];
