import { z } from "zod";
import { locales } from "@/i18n/routing";

export const bookingRequestSchema = z
  .object({
    kind: z.enum([
      "stay-unit",
      "stay-room",
      "rental",
      "excursion",
      "provision-order",
    ]),
    subjectSlug: z.string().min(1),
    refId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    guests: z.coerce.number().int().positive().max(40).optional(),
    quantity: z.coerce.number().int().positive().max(40).optional(),
    name: z.string().min(2, "too_short").max(120),
    email: z.string().email("bad_email"),
    phone: z.string().min(5, "too_short").max(40),
    message: z.string().max(2000).optional(),
    locale: z.enum(locales),
  })
  .refine(
    (v) =>
      !(v.startDate && v.endDate) ||
      new Date(v.endDate) > new Date(v.startDate),
    { path: ["endDate"], message: "end_before_start" },
  );

export type BookingRequestForm = z.infer<typeof bookingRequestSchema>;
