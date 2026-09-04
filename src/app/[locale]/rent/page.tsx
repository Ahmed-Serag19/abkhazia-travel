import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { RentalCard } from "@/components/site/RentalCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rent" });
  return { title: t("title"), description: t("lead") };
}

export default async function RentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  // "Rent items" is everything that isn't a car — a flat list here, though each
  // item still carries its category in the data for future filtering.
  const items = (await getData().listRentals()).filter(
    (r) => r.category !== "car",
  );

  return (
    <>
      <PageHeader
        photo="/photos/gagra-beach.jpg"
        kicker={t("brand.kicker")}
        title={t("rent.title")}
        lead={t("rent.lead")}
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 70}>
              <RentalCard item={item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
