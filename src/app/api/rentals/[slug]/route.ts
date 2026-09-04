import { jsonSource } from "@/lib/data";
import { notFound, ok, route } from "@/lib/api";

export const GET = route(
  "rentals.[slug].GET",
  async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const rental = await jsonSource.getRental(slug);
    if (!rental) return notFound("rental");
    return ok(rental);
  },
);
