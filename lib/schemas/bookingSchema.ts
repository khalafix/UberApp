import { z } from "zod";

const timeFormat = /^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;

// UAE phone number regex: Allows spaces for readability.
const uaePhoneNumberRegex =
  /^(?:\+971\s?5[0-9]{1}\s?[0-9]{3}\s?[0-9]{4}|05[0-9]{1}\s?[0-9]{3}\s?[0-9]{4})$/;

export const bookingSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z
    .string()
    .regex(
      uaePhoneNumberRegex,
      "Phone number must be a valid UAE mobile number (e.g., +971 50 123 4567 or 050 123 4567)"
    ),
  email: z.string().email("Invalid email format"),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bookingDate: z.string().optional(),
  bookingTime: z
    .string()
    .regex(timeFormat, "Invalid time format, expected 'HH:mm AM/PM'").optional(),
  serviceId: z.string().uuid("Invalid service ID format").optional(),
  isVIP: z.boolean().default(false),
  serviceOptionId: z.string().optional(),
  totalPrice: z.number().nullable().optional(),
});

export type BookingSchema = z.infer<typeof bookingSchema>;
