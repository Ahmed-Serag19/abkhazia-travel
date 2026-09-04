import { jsonSource } from "@/lib/data";
import { notFound, ok, route } from "@/lib/api";

export const GET = route(
  "properties.[slug].GET",
  async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const property = await jsonSource.getProperty(slug);
    if (!property) return notFound("property");
    return ok(property);
  },
);
