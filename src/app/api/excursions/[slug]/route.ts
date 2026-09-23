import { getServerData } from "@/lib/data";
import { notFound, ok, route } from "@/lib/api";

export const GET = route(
  "excursions.[slug].GET",
  async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const excursion = await getServerData().getExcursion(slug);
    if (!excursion) return notFound("excursion");
    return ok(excursion);
  },
);
