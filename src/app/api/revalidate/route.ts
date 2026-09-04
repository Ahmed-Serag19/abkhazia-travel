import { revalidatePath } from "next/cache";
import { fail, ok, route } from "@/lib/api";

/**
 * Called by the owner console after it writes the content file, so the guest
 * site's cached pages pick up the edit.
 *
 * The shared secret is a stopgap for the local setup — when the console moves
 * to Supabase this becomes a database webhook with a real signature.
 */
export const POST = route("revalidate.POST", async (req: Request) => {
  let body: { secret?: string } = {};
  try {
    body = await req.json();
  } catch {
    return fail("bad_json", "Body could not be parsed as JSON");
  }

  const expected = process.env.REVALIDATE_SECRET ?? "dev-secret";
  if (body.secret !== expected) {
    return fail("not_found", "revalidate");
  }

  // Everything renders from the same document, so refresh the whole tree.
  revalidatePath("/", "layout");

  return ok({ revalidated: true, at: new Date().toISOString() });
});
