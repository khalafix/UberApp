import { z } from "zod";

// UAE phone number regex with optional spaces for readability
const uaePhoneNumberRegex =
  /^(?:\+971\s?5[0-9]{1}\s?[0-9]{3}\s?[0-9]{4}|05[0-9]{1}\s?[0-9]{3}\s?[0-9]{4})$/;

// ISO date string regex (simplified)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Time in 24h format hh:mm (optional)
const time24hRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const resortsSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .regex(
      uaePhoneNumberRegex,
      "Phone number must be a valid UAE mobile number (e.g., +971 50 123 4567 or 050 123 4567)"
    ),
  email: z.string().email("Invalid email format"),

  checkInDate: z
    .string()
    .regex(isoDateRegex, "Check-in date must be in YYYY-MM-DD format"),
  checkOutDate: z
    .string()
    .regex(isoDateRegex, "Check-out date must be in YYYY-MM-DD format"),

  checkInTime: z
    .string()
    .regex(time24hRegex, "Check-in time must be in HH:mm 24h format"),
  checkOutTime: z
    .string()
    .regex(time24hRegex, "Check-out time must be in HH:mm 24h format"),

  adults: z
    .number()
    .min(1, "At least one adult is required")
    .max(9, "Adults cannot exceed 9"),
  children: z
    .number()
    .min(0, "Children cannot be less than 0")
    .max(9, "Children cannot exceed 9"),

  totalPrice: z.number().min(0).optional(),

  // Added serviceId as optional UUID string, like in bookingSchema
  serviceId: z.string().uuid("Invalid service ID format").optional(),
});

export type ResortsSchema = z.infer<typeof resortsSchema>;
