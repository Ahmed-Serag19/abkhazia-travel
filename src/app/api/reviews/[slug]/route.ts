import { getServerData } from "@/lib/data";
import { ok, route } from "@/lib/api";

// Reviews are keyed by the slug of the property or excursion they belong to.
// An unknown slug is an empty list, not a 404 — "no reviews yet" is a normal
// state and must not break the page that asked.
export const GET = route(
  "reviews.[slug].GET",
  async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    return ok(await getServerData().listReviews(slug));
  },
);
