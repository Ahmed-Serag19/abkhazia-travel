import { getTranslations } from "next-intl/server";
import { ArrowDown, MapPin, Package, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { ProductTile } from "@/components/ui/ProductTile";
import { BookingRequestForm } from "@/components/site/BookingRequestForm";
import { StickyBookBar } from "@/components/site/StickyBookBar";
import type { Locale, RentalItem } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

const BOOK_ID = "book";

/**
 * Detail view shared by `/cars/[slug]` and `/rent/[slug]`. The two routes
 * exist so a car lives at `/cars/…` and a paddleboard at `/rent/…`; the page
 * itself is identical.
 */
export async function RentalDetail({
  item,
  locale,
}: {
  item: RentalItem;
  locale: Locale;
}) {
  const t = await getTranslations();

  return (
    <>
      <Container className="pt-4 sm:pt-8">
        {item.photos.length ? (
          <HeroCarousel
            photos={item.photos.map((p) => ({
              src: p.src,
              alt: pick(p.alt, locale),
            }))}
          />
        ) : (
          <div className="relative -mx-5 h-[38svh] overflow-hidden sm:mx-0 sm:aspect-16/9 sm:h-auto sm:rounded-card">
            <ProductTile kind="rental" category={item.category} size="hero" />
          </div>
        )}

        <h1 className="mt-6 font-serif text-[1.9rem] leading-[1.12] text-ink sm:text-4xl">
          {pick(item.name, locale)}
        </h1>

        <ChipRow className="mt-4">
          <Chip tone="sage">{t(`rent.category.${item.category}`)}</Chip>
          <Chip tone="plain">
            {t("rent.quantityAvailable", { count: item.quantity })}
          </Chip>
          <Chip tone={item.delivery ? "blush" : "plain"}>
            {item.delivery ? t("rent.deliveryYes") : t("rent.deliveryNo")}
          </Chip>
        </ChipRow>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <p className="text-[0.95rem] text-ink-soft">
            <span className="font-serif text-3xl text-ink">
              {formatMoney(item.pricePerDay, locale)}
            </span>{" "}
            <span className="text-ink-faint">{t("rent.perDay")}</span>
          </p>
          <a
            href={`#${BOOK_ID}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-clay-500 px-5 text-[0.95rem] font-medium text-cream transition-colors hover:bg-clay-600"
          >
            {t("booking.title")}
            <ArrowDown size={16} />
          </a>
        </div>
      </Container>

      <Container className="mt-8 grid gap-12 pb-28 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:pb-0">
        <div className="min-w-0">
          <p className="text-[1.02rem] leading-[1.75] text-ink-soft">
            {pick(item.description, locale)}
          </p>

          <section className="mt-9">
            <SectionLabel>{t("rent.specs")}</SectionLabel>
            <dl className="mt-4 divide-y divide-ink/8 rounded-card border border-ink/8 bg-paper">
              {item.specs.map((spec) => (
                <div
                  key={spec.label.ru}
                  className="flex justify-between gap-4 px-4 py-3 text-[0.92rem]"
                >
                  <dt className="text-ink-faint">{pick(spec.label, locale)}</dt>
                  <dd className="text-right text-ink">
                    {pick(spec.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-card border border-ink/8 bg-cream-dim p-4">
              <MapPin
                size={18}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-clay-600"
              />
              <div>
                <p className="label-caps text-ink-faint">{t("rent.pickup")}</p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                  {pick(item.pickupPoint, locale)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-card border border-ink/8 bg-cream-dim p-4">
              {item.delivery ? (
                <Truck
                  size={18}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-clay-600"
                />
              ) : (
                <Package
                  size={18}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-clay-600"
                />
              )}
              <div>
                <p className="label-caps text-ink-faint">{t("rent.deposit")}</p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                  {formatMoney(item.deposit, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside
          id={BOOK_ID}
          className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start"
        >
          <BookingRequestForm
            kind="rental"
            subjectSlug={item.slug}
            refId={item.id}
            unitPrice={item.pricePerDay}
            pricing="per-day"
            subtitleKey="Rental"
          />
        </aside>
      </Container>

      <StickyBookBar
        price={formatMoney(item.pricePerDay, locale)}
        unitLabel={t("rent.perDay")}
        targetId={BOOK_ID}
      />
    </>
  );
}
