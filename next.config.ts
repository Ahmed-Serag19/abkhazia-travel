import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public bucket (swap in your project ref when wiring
      // the API). All current photography is local, under public/photos.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  /*
   * `data/content.json` is read at runtime by the API route handlers. Next's
   * dependency tracer can't see a path built with `process.cwd()`, so the file
   * has to be named explicitly or the deployed functions 404 on it.
   *
   * Pages don't need this — they're statically generated, so their content is
   * already baked into the HTML at build time.
   */
  outputFileTracingIncludes: {
    "/api/**": ["./data/content.json"],
  },
};

export default withNextIntl(nextConfig);
