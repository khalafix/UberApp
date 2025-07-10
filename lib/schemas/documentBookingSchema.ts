import { z } from "zod";

// UAE phone number regex: Allows spaces for readability.
const uaePhoneNumberRegex =
  /^(?:\+971\s?5[0-9]{1}\s?[0-9]{3}\s?[0-9]{4}|05[0-9]{1}\s?[0-9]{3}\s?[0-9]{4})$/;

export const documentBookingSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z
    .string()
    .regex(
      uaePhoneNumberRegex,
      "Phone number must be a valid UAE mobile number (e.g., +971 50 123 4567 or 050 123 4567)"
    ),
  email: z.string().email("Invalid email format"),
  serviceId: z.string().uuid("Invalid service ID format").optional(),
  nationalityId: z
  .string({ required_error: "Nationality is required" })
  .uuid("Invalid nationality ID format")
  .optional()
  .refine((val) => val !== undefined, {
    message: "Nationality is required",
  }),

  totalPrice: z.number().nullable().optional(),

  // Adding new fields
  adultsNumber: z
    .number()
    .min(1, "Adults number must be at least 1")
    .max(9, "Adults number cannot exceed 9"),
  // .default(1),

  childrenNumber: z
    .number()
    .min(0, "Children number cannot be less than 0")
    .max(9, "Children number cannot exceed 9"),
  // .default(0),

  entryType: z.enum(["single", "multiple"]).default("single"),

  duration: z.enum(["30 days", "60 days"]).default("30 days"),
  processTime: z
    .enum(["Express - 1~2 working days", "Regular - 3-5 working days"])
    .default("Regular - 3-5 working days"),
});

export type DocumentBookingSchema = z.infer<typeof documentBookingSchema>;
