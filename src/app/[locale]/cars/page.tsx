import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { RentalCard } from "@/components/site/RentalCard";
import { BenefitStrip } from "@/components/site/BenefitStrip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cars" });
  return { title: t("title"), description: t("lead") };
}

export default async function CarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const cars = (await getData().listRentals()).filter(
    (r) => r.category === "car",
  );

  return (
    <>
      <PageHeader
        photo="/photos/bzyb-river.jpg"
        kicker={t("brand.kicker")}
        title={t("cars.title")}
        lead={t("cars.lead")}
      />

      <Container className="py-12 sm:py-16">
        <Reveal>
          <BenefitStrip />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car, i) => (
            <Reveal key={car.id} delay={i * 90}>
              <RentalCard item={car} hrefBase="/cars" showCategory={false} />
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
