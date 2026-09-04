import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "en", "ab"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
  // "ru" is served from "/", "en" from "/en", "ab" from "/ab"
  localePrefix: "as-needed",
});
