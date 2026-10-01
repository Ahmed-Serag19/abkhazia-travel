import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Photos uploaded from the owner console (supabase/storage.sql). Pinned
      // to this project's public photo bucket rather than *.supabase.co: the
      // image optimiser fetches and re-serves whatever a pattern allows, so a
      // wildcard would let anyone use this site to proxy images from any
      // Supabase project. Older photography is local, under public/photos.
      {
        protocol: "https",
        hostname: "lkrckfyimnxpigpppfrz.supabase.co",
        pathname: "/storage/v1/object/public/photos/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
