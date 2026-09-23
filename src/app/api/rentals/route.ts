import { getServerData } from "@/lib/data";
import { ok, route } from "@/lib/api";

// Serves whichever source is configured — Supabase when DATABASE_URL is set,
// the editable content file otherwise. Anything thrown below
// becomes a logged, referenced 500 — never a stack trace in the response body.
export const GET = route("rentals.GET", async () => {
  return ok(await getServerData().listRentals());
});
