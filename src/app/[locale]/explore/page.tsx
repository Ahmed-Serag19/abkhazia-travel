import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { ExcursionCard } from "@/components/site/ExcursionCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "explore" });
  return { title: t("title"), description: t("lead") };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const excursions = await getData().listExcursions();

  return (
    <>
      <PageHeader
        photo="/photos/ritsa-lake.jpg"
        kicker={t("brand.kicker")}
        title={t("explore.title")}
        lead={t("explore.lead")}
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {excursions.map((excursion, i) => (
            <Reveal key={excursion.id} delay={i * 90}>
              <ExcursionCard excursion={excursion} />
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
