import { z } from 'zod';

/**
 * Builds the Zod schema for the booking form.
 *
 * @param {string[]} availableTimeSlots - time slots fetched from `/api/time-slots`
 */
export const createBookingSchema = (availableTimeSlots = []) =>
  z.object({
    bookerName: z
      .string({ required_error: 'Booker name is required' })
      .min(2, { message: 'Booker name must be at least 2 characters long' }),

    bookerEmail: z.preprocess(
      (value) => {
        if (typeof value === 'string' && value.trim() === '') {
          return undefined;
        }
        return value;
      },
      z.string().email({ message: 'Invalid email address' }).optional()
    ),

    eventName: z
      .string({ required_error: 'Event name is required' })
      .min(2, { message: 'Event name must be at least 2 characters long' }),

    eventDate: z.preprocess(
      (value) => {
        if (typeof value === 'string' || value instanceof Date) {
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? value : date;
        }
        return value;
      },
      z
        .date({
          required_error: 'Event date is required',
          invalid_type_error: 'Event date must be a valid date',
        })
        .refine((date) => date > new Date(), {
          message: 'Event date must be in the future',
        })
    ),

    numberOfGuests: z.preprocess(
      (value) => {
        if (typeof value === 'string' && value.trim() !== '') {
          return Number(value);
        }
        return value;
      },
      z
        .number({
          required_error: 'Number of Guests is required',
          invalid_type_error: 'Number of Guests must be a number',
        })
        .int({ message: 'Number of Guests must be an integer' })
        .min(1, { message: 'Number of Guests must be at least 1' })
        .max(10, { message: 'Number of Guests must be less than or equal to 10' })
    ),

    timeSlot: z
      .string({ required_error: 'Time slot is required' })
      .refine((value) => availableTimeSlots.includes(value), {
        message: 'Selected time slot is unavailable',
      }),

    eventLink: z
      .string({ required_error: 'Event link is required' })
      .url({ message: 'Invalid URL. Please enter a valid event link' }),
  });
