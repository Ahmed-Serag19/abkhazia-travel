import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

const SECTIONS = [
  { href: "/stay", key: "stay" },
  { href: "/explore", key: "explore" },
  { href: "/cars", key: "cars" },
  { href: "/rent", key: "rent" },
  { href: "/village", key: "village" },
] as const;

/**
 * Layer 1 — the route that isn't there.
 *
 * Reached when a page calls `notFound()` (an unknown property slug) and when
 * no route matches at all. Both cases want the same thing: say what happened
 * plainly, then give people somewhere to go.
 */
export default function NotFound() {
  const t = useTranslations();

  return (
    // The site header is opaque on this route, so the section starts below it
    // rather than bleeding underneath — no negative margin, no stray overflow.
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end overflow-hidden bg-night sm:min-h-[calc(100svh-5rem)]">
      <Image
        src="/photos/mussera-ruins.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="scrim-bottom absolute inset-0" />

      <Container className="relative pb-14 pt-12 sm:pb-20">
        <p className="label-caps flex items-center gap-3 text-cream/70">
          <span className="h-px w-6 bg-cream/40" />
          {t("notFound.kicker")}
        </p>

        <h1 className="mt-5 max-w-2xl font-serif text-[2.3rem] leading-[1.08] text-cream sm:text-6xl">
          {t("notFound.title")}
        </h1>

        <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-cream/80 sm:text-lg">
          {t("notFound.body")}
        </p>

        <ButtonLink href="/" variant="onClay" size="lg" className="mt-8">
          {t("notFound.home")}
          <ArrowRight size={17} />
        </ButtonLink>

        <div className="mt-10 border-t border-cream/15 pt-6">
          <p className="label-caps text-cream/55">{t("notFound.sections")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-full border border-cream/30 bg-cream/10 px-4 py-2 text-[0.9rem] text-cream backdrop-blur-md transition-colors hover:border-cream/55 hover:bg-cream/20"
              >
                {t(`nav.${section.key}`)}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
