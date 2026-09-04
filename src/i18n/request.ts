import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

/**
 * Overlay `override` on top of `base`, key by key.
 *
 * Russian is the source language, so any key a translation has not reached
 * yet resolves to the Russian string instead of throwing MISSING_MESSAGE and
 * rendering the raw key path to a visitor. Adding a key to `ru.json` can
 * therefore never break `/en` or `/ab`.
 */
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    if (
      value &&
      typeof value === "object" &&
      existing &&
      typeof existing === "object"
    ) {
      out[key] = deepMerge(existing, value);
    } else if (value !== undefined && value !== "") {
      out[key] = value;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import("../messages/ru.json")).default as Messages;
  const messages =
    locale === routing.defaultLocale
      ? base
      : deepMerge(
          base,
          (await import(`../messages/${locale}.json`)).default as Messages,
        );

  return {
    locale,
    messages,
    onError(error) {
      // A missing message can no longer reach a visitor thanks to the merge
      // above, but log anything else so real problems stay visible.
      if (error.code === "MISSING_MESSAGE") return;
      console.error("[i18n]", error);
    },
  };
});
