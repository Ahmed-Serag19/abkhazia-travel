import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Lora, Manrope, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/site/Header";
import { Main } from "@/components/site/Main";
import { Footer } from "@/components/site/Footer";
import "../globals.css";

/*
 * `cyrillic-ext` is not optional here. Abkhaz is written with extended
 * Cyrillic — Ҧ Ҭ Ӡ Ҷ Ә Ҩ Ҕ Ҳ Ҵ Ҽ Ҿ, all in U+0460–052F — and a font without
 * that block silently falls back to whatever the device has, so /ab renders
 * in a mix of two typefaces.
 *
 * Playfair Display was the original display face and ships only U+0400–045F,
 * i.e. Russian but not Abkhaz. Lora covers the extended block, has a proper
 * italic for the wordmark, and keeps the warm editorial feel.
 */
const display = Lora({
  variable: "--font-display",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const label = JetBrains_Mono({
  variable: "--font-label",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Where relative image paths in metadata resolve from.
 *
 * Property pages set `openGraph.images` to `/photos/…`. Without a base those
 * resolve against localhost, so every link shared from the deployed site would
 * preview a broken image. Vercel injects `VERCEL_PROJECT_PRODUCTION_URL`
 * automatically, so this works on a fresh import before any env var is set.
 */
function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Casa Colina — Абхазия",
    template: "%s · Casa Colina",
  },
  description:
    "Жильё на фермах, продукты из деревни, аренда и экскурсии по абхазскому побережью.",
};

/**
 * Pages are statically generated and then re-generated at most this often.
 *
 * The owner console calls `/api/revalidate` after every edit, so a change is
 * normally live within seconds. This is the floor under that: if the webhook
 * is misconfigured, the console is offline, or somebody changes a row in the
 * Supabase table editor by hand, the site still catches up on its own within
 * five minutes instead of serving the build-time snapshot until the next
 * deploy.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${label.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <NextIntlClientProvider>
          <Header />
          <Main>{children}</Main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
