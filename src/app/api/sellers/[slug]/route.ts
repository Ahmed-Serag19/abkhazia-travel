import { jsonSource } from "@/lib/data";
import { notFound, ok, route } from "@/lib/api";

export const GET = route(
  "sellers.[slug].GET",
  async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const seller = await jsonSource.getSeller(slug);
    if (!seller) return notFound("seller");
    return ok(seller);
  },
);
