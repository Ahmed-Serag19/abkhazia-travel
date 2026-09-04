import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowDown, CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";
import { getData, optional } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { BookingRequestForm } from "@/components/site/BookingRequestForm";
import { Reviews } from "@/components/site/Reviews";
import { StickyBookBar } from "@/components/site/StickyBookBar";
import type { Locale } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

const BOOK_ID = "book";

export async function generateStaticParams() {
  const excursions = await getData().listExcursions();
  return routing.locales.flatMap((locale) =>
    excursions.map((e) => ({ locale, slug: e.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const excursion = await getData().getExcursion(slug);
  if (!excursion) return {};
  return {
    title: pick(excursion.name, locale as Locale),
    description: pick(excursion.summary, locale as Locale),
    openGraph: {
      title: pick(excursion.name, locale as Locale),
      description: pick(excursion.summary, locale as Locale),
      images: excursion.photos[0] ? [excursion.photos[0].src] : [],
    },
  };
}

export default async function ExcursionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const data = getData();
  const excursion = await data.getExcursion(slug);
  if (!excursion) notFound();

  const reviews = await optional(
    `reviews:${slug}`,
    () => data.listReviews(slug),
    [],
  );

  const t = await getTranslations();

  return (
    <>
      <Container className="pt-4 sm:pt-8">
        <HeroCarousel
          photos={excursion.photos.map((p) => ({
            src: p.src,
            alt: pick(p.alt, locale),
          }))}
        >
          <div className="flex flex-wrap gap-2">
            <Chip tone="clay">
              {t("explore.duration", { hours: excursion.durationHours })}
            </Chip>
            <Chip tone="sage">
              {t("explore.groupUpTo", { count: excursion.groupMax })}
            </Chip>
          </div>
          <h1 className="mt-3 font-serif text-[1.9rem] leading-[1.12] text-cream sm:text-4xl">
            {pick(excursion.name, locale)}
          </h1>
          <p className="mt-2.5 flex items-center gap-1.5 text-[0.85rem] text-cream/85">
            <MapPin size={14} strokeWidth={1.8} />
            {pick(excursion.meetingPoint, locale)}
          </p>
        </HeroCarousel>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <p className="text-[0.95rem] text-ink-soft">
            <span className="font-serif text-3xl text-ink">
              {formatMoney(excursion.pricePerPerson, locale)}
            </span>{" "}
            <span className="text-ink-faint">{t("explore.perPerson")}</span>
          </p>
          <a
            href={`#${BOOK_ID}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-clay-500 px-5 text-[0.95rem] font-medium text-cream transition-colors hover:bg-clay-600"
          >
            {t("booking.title")}
            <ArrowDown size={16} />
          </a>
        </div>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          {pick(excursion.summary, locale)}
        </p>

        <ChipRow className="mt-5">
          {excursion.highlights.map((line) => (
            <Chip key={line.ru} tone="blush">
              {pick(line, locale)}
            </Chip>
          ))}
        </ChipRow>
      </Container>

      <Container className="mt-10 grid gap-12 pb-28 lg:grid-cols-[1.5fr_1fr] lg:gap-14 lg:pb-0">
        <div className="min-w-0">
          <p className="whitespace-pre-line text-[1.02rem] leading-[1.75] text-ink-soft">
            {pick(excursion.description, locale)}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Fact
              Icon={CalendarDays}
              label={t("explore.schedule")}
              value={pick(excursion.schedule, locale)}
            />
            <Fact
              Icon={Clock}
              label={t("explore.duration", { hours: excursion.durationHours })}
              value={pick(excursion.meetingPoint, locale)}
            />
            <Fact
              Icon={Users}
              label={t("explore.groupUpTo", { count: excursion.groupMax })}
              value={`${excursion.groupMax}`}
            />
            <Fact
              Icon={MapPin}
              label={t("explore.meetingPoint")}
              value={pick(excursion.meetingPoint, locale)}
            />
          </div>

          <section className="mt-10">
            <SectionLabel>{t("explore.includes")}</SectionLabel>
            <ul className="mt-4 space-y-2.5">
              {excursion.includes.map((line) => (
                <li
                  key={line.ru}
                  className="flex gap-2.5 text-[0.95rem] leading-relaxed text-ink-soft"
                >
                  <Check
                    size={16}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-sea-500"
                  />
                  {pick(line, locale)}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12">
            <Reviews reviews={reviews} />
          </div>
        </div>

        <aside id={BOOK_ID} className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start">
          <BookingRequestForm
            kind="excursion"
            subjectSlug={excursion.slug}
            refId={excursion.id}
            unitPrice={excursion.pricePerPerson}
            pricing="per-person"
            subtitleKey="Excursion"
          />
        </aside>
      </Container>

      <StickyBookBar
        price={formatMoney(excursion.pricePerPerson, locale)}
        unitLabel={t("explore.perPerson")}
        targetId={BOOK_ID}
      />
    </>
  );
}

function Fact({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-card border border-ink/8 bg-cream-dim p-4">
      <Icon
        size={18}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-clay-600"
      />
      <div className="min-w-0">
        <p className="label-caps text-ink-faint">{label}</p>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
          {value}
        </p>
      </div>
    </div>
  );
}
