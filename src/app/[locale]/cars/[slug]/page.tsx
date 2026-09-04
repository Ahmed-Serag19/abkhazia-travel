import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { RentalDetail } from "@/components/site/RentalDetail";
import type { Locale } from "@/lib/types";
import { t as pick } from "@/lib/utils";

export async function generateStaticParams() {
  const rentals = await getData().listRentals();
  return routing.locales.flatMap((locale) =>
    rentals
      .filter((r) => r.category === "car")
      .map((r) => ({ locale, slug: r.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getData().getRental(slug);
  if (!item) return {};
  return {
    title: pick(item.name, locale as Locale),
    description: pick(item.description, locale as Locale),
  };
}

export default async function CarPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);

  const item = await getData().getRental(slug);
  if (!item || item.category !== "car") notFound();

  return <RentalDetail item={item} locale={rawLocale as Locale} />;
}
