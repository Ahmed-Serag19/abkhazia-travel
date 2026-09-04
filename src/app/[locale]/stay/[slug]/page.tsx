import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowDown, Clock, LogIn, LogOut, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { fromPriceOf, getData, optional } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { Monogram } from "@/components/ui/Monogram";
import { AmenityList } from "@/components/site/AmenityList";
import { BenefitStrip } from "@/components/site/BenefitStrip";
import { BookableOption } from "@/components/site/BookableOption";
import { Reviews } from "@/components/site/Reviews";
import { StickyBookBar } from "@/components/site/StickyBookBar";
import type { Locale } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

const OPTIONS_ID = "options";

export async function generateStaticParams() {
  const properties = await getData().listProperties();
  return routing.locales.flatMap((locale) =>
    properties.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getData().getProperty(slug);
  if (!property) return {};
  return {
    title: pick(property.name, locale as Locale),
    description: pick(property.tagline, locale as Locale),
    openGraph: {
      title: pick(property.name, locale as Locale),
      description: pick(property.tagline, locale as Locale),
      images: property.photos[0] ? [property.photos[0].src] : [],
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const data = getData();

  // The subject of the page: allowed to throw so error.tsx can offer a retry.
  const property = await data.getProperty(slug);
  if (!property) notFound();

  // Supporting content: degrades to nothing rather than taking the page down.
  const reviews = await optional(
    `reviews:${slug}`,
    () => data.listReviews(slug),
    [],
  );

  const t = await getTranslations();
  const fromPrice = fromPriceOf(property);
  const priceUnit =
    property.kind === "compound"
      ? t("stay.priceUnitNight")
      : t("stay.priceUnitPerson");

  return (
    <>
      <Container className="pt-4 sm:pt-8">
        <HeroCarousel
          photos={property.photos.map((p) => ({
            src: p.src,
            alt: pick(p.alt, locale),
          }))}
        >
          <Chip tone={property.kind === "compound" ? "clay" : "blush"}>
            {t(`stay.kind.${property.kind}`)}
          </Chip>
          <h1 className="mt-3 font-serif text-[2rem] leading-[1.1] text-cream sm:text-4xl">
            {pick(property.name, locale)}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.85rem] text-cream/85">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.8} />
              {pick(property.location.area, locale)},{" "}
              {pick(property.location.region, locale)}
            </span>
            {property.rating ? (
              <span className="flex items-center gap-1.5">
                <Star size={14} className="fill-sand text-sand" />
                {property.rating.toFixed(1)}
                <span className="text-cream/60">· {property.reviewCount}</span>
              </span>
            ) : null}
          </div>
        </HeroCarousel>

        {/* price and the way to act on it, straight under the photo */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <p className="text-[0.95rem] text-ink-soft">
            {t("common.from")}{" "}
            <span className="font-serif text-3xl text-ink">
              {formatMoney(fromPrice, locale)}
            </span>{" "}
            <span className="text-ink-faint">{priceUnit}</span>
          </p>
          <a
            href={`#${OPTIONS_ID}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-clay-500 px-5 text-[0.95rem] font-medium text-cream transition-colors hover:bg-clay-600"
          >
            {property.kind === "compound"
              ? t("stay.chooseUnit")
              : t("stay.chooseRoom")}
            <ArrowDown size={16} />
          </a>
        </div>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          {pick(property.tagline, locale)}
        </p>

        <ChipRow className="mt-5">
          {property.highlights.map((highlight) => (
            <Chip key={highlight.ru} tone="sage">
              {pick(highlight, locale)}
            </Chip>
          ))}
        </ChipRow>

        <div className="mt-8">
          <BenefitStrip />
        </div>
      </Container>

      {/* pb clears the phone-only action bar so the last card is never trapped under it */}
      <Container className="mt-12 grid gap-12 pb-28 lg:grid-cols-[1.6fr_1fr] lg:gap-14 lg:pb-0">
        <div className="min-w-0">
          <section>
            <SectionLabel>{t("stay.aboutPlace")}</SectionLabel>
            <p className="mt-4 whitespace-pre-line text-[1.02rem] leading-[1.75] text-ink-soft">
              {pick(property.story, locale)}
            </p>
          </section>

          {property.host ? (
            <section className="mt-10 rounded-card border border-ink/10 bg-paper p-5">
              <SectionLabel>{t("stay.theHost")}</SectionLabel>
              <div className="mt-4 flex items-center gap-3">
                {property.host.photo ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={property.host.photo.src}
                      alt={pick(property.host.photo.alt, locale)}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Monogram
                    name={property.host.name}
                    className="size-14 shrink-0 text-xl"
                  />
                )}
                <div>
                  <p className="font-serif text-xl text-ink">
                    {property.host.name}
                  </p>
                  <p className="text-[0.8rem] text-ink-faint">
                    {t("stay.hostSince", { year: property.host.since })}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-soft">
                {pick(property.host.about, locale)}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.82rem] text-ink-faint">
                <span className="flex items-center gap-2">
                  <Clock size={13} strokeWidth={1.8} />
                  {t("stay.respondsIn", {
                    hours: property.host.responseTimeHours,
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle size={13} strokeWidth={1.8} />
                  {property.host.languages.join(" · ")}
                </span>
              </div>
            </section>
          ) : null}

          {/* the two Stay modes diverge here */}
          <section id={OPTIONS_ID} className="mt-12 scroll-mt-24">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">
              {property.kind === "compound"
                ? t("stay.chooseUnit")
                : t("stay.chooseRoom")}
            </h2>

            <div className="mt-5 space-y-4">
              {property.kind === "compound"
                ? property.units.map((unit) => (
                    <BookableOption
                      key={unit.id}
                      kind="stay-unit"
                      subjectSlug={property.slug}
                      refId={unit.id}
                      pricing="per-night"
                      name={pick(unit.name, locale)}
                      description={pick(unit.description, locale)}
                      photos={unit.photos}
                      price={unit.pricePerNight}
                      priceUnitLabel={t("stay.priceUnitNight")}
                      amenities={unit.amenities}
                      facts={[
                        t("stay.sleeps", { count: unit.guests }),
                        t("stay.bedrooms", { count: unit.bedrooms }),
                        t("stay.beds", { count: unit.beds }),
                        t("stay.baths", { count: unit.baths }),
                        ...(unit.sizeSqm
                          ? [t("stay.sqm", { count: unit.sizeSqm })]
                          : []),
                      ]}
                    />
                  ))
                : property.rooms.map((room) => (
                    <BookableOption
                      key={room.id}
                      kind="stay-room"
                      subjectSlug={property.slug}
                      refId={room.id}
                      pricing="per-person-night"
                      name={pick(room.name, locale)}
                      description={pick(room.description, locale)}
                      photos={room.photos}
                      price={room.pricePerPerson}
                      priceUnitLabel={t("stay.priceUnitPerson")}
                      amenities={room.amenities}
                      note={t("stay.roomsAvailable", { count: room.quantity })}
                      facts={[t("stay.sleeps", { count: room.guestsPerRoom })]}
                    />
                  ))}
            </div>
          </section>

          <section className="mt-12">
            <SectionLabel>{t("stay.amenities")}</SectionLabel>
            <AmenityList amenities={property.amenities} className="mt-5" />
          </section>

          <div className="mt-12">
            <Reviews reviews={reviews} />
          </div>

          <section className="mt-12">
            <SectionLabel>{t("stay.houseRules")}</SectionLabel>
            <ul className="mt-4 space-y-2.5">
              {property.houseRules.map((rule) => (
                <li
                  key={rule.ru}
                  className="flex gap-2.5 text-[0.92rem] leading-relaxed text-ink-soft"
                >
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-clay-400" />
                  {pick(rule, locale)}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* practicalities */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card border border-ink/10 bg-paper p-5">
            <p className="text-[0.9rem] text-ink-soft">
              {t("common.from")}{" "}
              <span className="font-serif text-2xl text-ink">
                {formatMoney(fromPrice, locale)}
              </span>{" "}
              <span className="text-ink-faint">{priceUnit}</span>
            </p>

            <dl className="mt-5 space-y-4 border-t border-ink/10 pt-5 text-[0.88rem]">
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-ink-faint">
                  <LogIn size={14} strokeWidth={1.8} />
                  {t("stay.checkIn")}
                </dt>
                <dd className="text-ink">{property.checkIn}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-ink-faint">
                  <LogOut size={14} strokeWidth={1.8} />
                  {t("stay.checkOut")}
                </dt>
                <dd className="text-ink">{property.checkOut}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-ink-faint">
                  <ShieldCheck size={14} strokeWidth={1.8} />
                  {t("stay.cancellation")}
                </dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">
                  {pick(property.cancellation.note, locale)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </Container>

      <StickyBookBar
        price={`${t("common.from")} ${formatMoney(fromPrice, locale)}`}
        unitLabel={priceUnit}
        targetId={OPTIONS_ID}
      />
    </>
  );
}
