import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { BenefitStrip } from "@/components/site/BenefitStrip";
import { PropertyCard } from "@/components/site/PropertyCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stay" });
  return { title: t("title"), description: t("lead") };
}

export default async function StayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const properties = await getData().listProperties();

  const compounds = properties.filter((p) => p.kind === "compound");
  const hosted = properties.filter((p) => p.kind === "hosted");

  return (
    <>
      <PageHeader
        photo="/photos/coast-hillside.jpg"
        kicker={t("brand.kicker")}
        title={t("stay.title")}
        lead={t("stay.lead")}
      />

      <Container className="py-12 sm:py-16">
        <Reveal>
          <BenefitStrip />
        </Reveal>

        <section className="mt-12">
          <SectionLabel>{t("stay.kind.compound")}</SectionLabel>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {compounds.map((property, i) => (
              <Reveal key={property.id} delay={i * 90}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionLabel>{t("stay.kind.hosted")}</SectionLabel>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hosted.map((property, i) => (
              <Reveal key={property.id} delay={i * 90}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
