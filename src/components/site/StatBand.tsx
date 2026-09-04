import { useTranslations } from "next-intl";
import { CountUp } from "@/components/motion/CountUp";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

/** Real counts, straight from the content — not invented marketing numbers. */
export function StatBand({
  properties,
  rentals,
  excursions,
  provisions,
}: {
  properties: number;
  rentals: number;
  excursions: number;
  provisions: number;
}) {
  const t = useTranslations("home.stats");

  const items = [
    { to: properties, label: t("properties") },
    { to: rentals, label: t("rentals") },
    { to: excursions, label: t("excursions") },
    { to: provisions, label: t("provisions") },
  ];

  return (
    <section className="night-ground py-14 sm:py-20">
      <Container>
        <Reveal>
          <p className="label-caps text-cream/45">{t("kicker")}</p>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-10 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 90}>
              <p className="font-serif text-5xl text-cream sm:text-6xl">
                <CountUp to={item.to} />
              </p>
              <p className="mt-2 text-[0.88rem] leading-snug text-cream/60">
                {item.label}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-12 max-w-2xl border-l-2 border-clay-500 pl-5 font-serif text-xl leading-relaxed text-cream/85 sm:text-2xl">
            {t("note")}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
