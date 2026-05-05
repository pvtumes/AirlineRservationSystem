/**
 * cancelBooking — service wrapper for cancelling a booking.
 * Calls cancelBookingRecord from the store, returns updated record.
 */
import { cancelBookingRecord } from '../data/bookings.js';

export async function cancelBooking(bookingRef) {
  await new Promise(r => setTimeout(r, 600)); // simulate async
  const result = cancelBookingRecord(bookingRef);
  if (!result) throw new Error('Booking not found.');
  return result;
}

export { fetchSeatMapAPI, getSeatExtraPrice, createBooking } from './bookingService.js';
