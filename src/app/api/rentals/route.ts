import { jsonSource } from "@/lib/data";
import { ok, route } from "@/lib/api";

// Serves the editable content file, so the API reflects owner edits. Swap
// `jsonSource` for Drizzle queries when Supabase lands. Anything thrown below
// becomes a logged, referenced 500 — never a stack trace in the response body.
export const GET = route("rentals.GET", async () => {
  return ok(await jsonSource.listRentals());
});
