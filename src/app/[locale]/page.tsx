import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Hero } from "@/components/site/Hero";
import { CategoryShowcase } from "@/components/site/CategoryShowcase";
import { PlaceMarquee } from "@/components/site/PlaceMarquee";
import { StatBand } from "@/components/site/StatBand";
import { HowItWorks } from "@/components/site/HowItWorks";
import { BenefitStrip } from "@/components/site/BenefitStrip";
import { PropertyCard } from "@/components/site/PropertyCard";
import { ExcursionCard } from "@/components/site/ExcursionCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const data = getData();
  const [properties, excursions, rentals, provisions] = await Promise.all([
    data.listProperties(),
    data.listExcursions(),
    data.listRentals(),
    data.listProvisions(),
  ]);

  return (
    <>
      <Hero />

      {/* the five ways in */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              kicker={t("home.chooseSection")}
              title={t("home.chooseTitle")}
              lead={t("home.chooseLead")}
            />
          </Reveal>
          <div className="mt-10">
            <CategoryShowcase />
          </div>
        </Container>
      </section>

      <PlaceMarquee />

      <StatBand
        properties={properties.length}
        rentals={rentals.length}
        excursions={excursions.length}
        provisions={provisions.length}
      />

      {/* stays */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <SectionHeading
                kicker={t("home.staysTitle")}
                title={t("stay.title")}
                lead={t("stay.lead")}
              />
            </Reveal>
            <Reveal delay={120}>
              <ButtonLink href="/stay" variant="secondary" size="sm">
                {t("common.viewAll")}
              </ButtonLink>
            </Reveal>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, i) => (
              <Reveal key={property.id} delay={i * 90}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={150}>
            <div className="mt-10">
              <BenefitStrip />
            </div>
          </Reveal>
        </Container>
      </section>

      <HowItWorks />

      {/* excursions */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <SectionHeading
                kicker={t("home.exploreTitle")}
                title={t("explore.title")}
                lead={t("explore.lead")}
              />
            </Reveal>
            <Reveal delay={120}>
              <ButtonLink href="/explore" variant="secondary" size="sm">
                {t("common.viewAll")}
              </ButtonLink>
            </Reveal>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {excursions.slice(0, 3).map((excursion, i) => (
              <Reveal key={excursion.id} delay={i * 90}>
                <ExcursionCard excursion={excursion} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* closing invitation, over the mountains */}
      <section className="pb-6">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-card">
              <Image
                src="/photos/caucasus-peaks.jpg"
                alt=""
                width={1600}
                height={963}
                sizes="(min-width: 1152px) 1088px, 100vw"
                className="h-[22rem] w-full object-cover sm:h-[26rem]"
              />
              <div className="scrim-card absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center sm:p-14">
                <h2 className="max-w-xl font-serif text-[1.7rem] leading-tight text-cream sm:text-4xl">
                  {t("home.ctaTitle")}
                </h2>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-cream/80">
                  {t("home.ctaLead")}
                </p>
                <ButtonLink
                  href="/stay"
                  variant="onClay"
                  size="lg"
                  className="mt-7"
                >
                  {t("home.ctaButton")}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
