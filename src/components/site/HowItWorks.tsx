import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Explains request-to-book up front. This is a trust element, not decoration —
 * people need to know no card is charged on the site.
 */
export function HowItWorks() {
  const t = useTranslations("home.how");
  const steps = ["one", "two", "three"] as const;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading kicker={t("kicker")} title={t("title")} lead={t("lead")} />
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {steps.map((step, i) => (
            <Reveal key={step} delay={i * 110} as="li">
              <div className="flex h-full flex-col rounded-card border border-ink/10 bg-paper p-6">
                <span className="font-serif text-4xl text-clay-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-serif text-xl text-ink">
                  {t(`${step}.title`)}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">
                  {t(`${step}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
