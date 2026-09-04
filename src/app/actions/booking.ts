"use server";

import { getData } from "@/lib/data";
import { bookingRequestSchema } from "@/lib/validation";

export interface BookingFormState {
  status: "idle" | "success" | "error";
  /** field name -> message key, resolved against `booking.errors.*` */
  fieldErrors?: Record<string, string>;
  error?: string;
}

export async function submitBookingRequest(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const raw = Object.fromEntries(formData.entries());
  // strip empty optionals so zod's `.optional()` applies
  for (const [k, v] of Object.entries(raw)) {
    if (v === "") delete raw[k];
  }

  const parsed = bookingRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(flat)) {
      if (messages?.[0]) fieldErrors[field] = messages[0];
    }
    return { status: "error", fieldErrors };
  }

  try {
    // TODO(api): this goes to Drizzle + an owner notification once the DB is live.
    await getData().createBookingRequest(parsed.data);
    return { status: "success" };
  } catch {
    return { status: "error", error: "generic" };
  }
}
