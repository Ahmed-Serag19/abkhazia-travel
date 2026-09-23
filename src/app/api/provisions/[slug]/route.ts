import { getServerData } from "@/lib/data";
import { notFound, ok, route } from "@/lib/api";

export const GET = route(
  "provisions.[slug].GET",
  async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const provision = await getServerData().getProvision(slug);
    if (!provision) return notFound("provision");
    return ok(provision);
  },
);
