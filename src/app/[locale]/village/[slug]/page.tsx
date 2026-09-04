import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowDown, Truck } from "lucide-react";
import { getData } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { Monogram } from "@/components/ui/Monogram";
import { ProductTile } from "@/components/ui/ProductTile";
import { BookingRequestForm } from "@/components/site/BookingRequestForm";
import { StickyBookBar } from "@/components/site/StickyBookBar";
import type { Locale } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

const BOOK_ID = "order";

export async function generateStaticParams() {
  const provisions = await getData().listProvisions();
  return routing.locales.flatMap((locale) =>
    provisions.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const provision = await getData().getProvision(slug);
  if (!provision) return {};
  return {
    title: pick(provision.name, locale as Locale),
    description: pick(provision.description, locale as Locale),
  };
}

export default async function ProvisionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const data = getData();
  const provision = await data.getProvision(slug);
  if (!provision) notFound();

  const sellers = await data.listSellers();
  const seller = sellers.find((s) => s.id === provision.sellerId);
  const t = await getTranslations();

  const unitLabel = t("village.perUnit", {
    unit: pick(provision.unitLabel, locale),
  });

  return (
    <>
      <Container className="pt-4 sm:pt-8">
        {provision.photos.length ? (
          <HeroCarousel
            photos={provision.photos.map((p) => ({
              src: p.src,
              alt: pick(p.alt, locale),
            }))}
          />
        ) : (
          // Stand-in mark until there is a photograph of this product.
          <div className="relative -mx-5 h-[34svh] overflow-hidden sm:mx-0 sm:aspect-16/9 sm:h-auto sm:rounded-card">
            <ProductTile
              kind="provision"
              category={provision.category}
              size="hero"
            />
          </div>
        )}

        <h1 className="mt-6 font-serif text-[1.9rem] leading-[1.12] text-ink sm:text-4xl">
          {pick(provision.name, locale)}
        </h1>

        <ChipRow className="mt-4">
          <Chip tone="sand">{t(`village.category.${provision.category}`)}</Chip>
          <Chip tone={provision.inStock ? "sage" : "plain"}>
            {provision.inStock ? t("common.inStock") : t("common.outOfStock")}
          </Chip>
        </ChipRow>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <p className="text-[0.95rem] text-ink-soft">
            <span className="font-serif text-3xl text-ink">
              {formatMoney(provision.price, locale)}
            </span>{" "}
            <span className="text-ink-faint">{unitLabel}</span>
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
            {pick(provision.description, locale)}
          </p>

          {seller ? (
            <div className="mt-8 flex gap-4 rounded-card border border-ink/8 bg-paper p-4">
              {seller.photo ? (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={seller.photo.src}
                    alt={pick(seller.photo.alt, locale)}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <Monogram
                  name={pick(seller.name, locale)}
                  className="size-16 shrink-0 text-2xl"
                />
              )}
              <div className="min-w-0">
                <p className="label-caps text-ink-faint">{t("village.soldBy")}</p>
                <p className="mt-1 font-serif text-lg text-ink">
                  {pick(seller.name, locale)}
                </p>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
                  {pick(seller.about, locale)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3 rounded-card border border-ink/8 bg-cream-dim p-4">
            <Truck
              size={18}
              strokeWidth={1.7}
              className="mt-0.5 shrink-0 text-clay-600"
            />
            <div>
              <p className="label-caps text-ink-faint">
                {t("village.deliveryInfo")}
              </p>
              <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                {pick(provision.deliveryNote, locale)}
              </p>
            </div>
          </div>
        </div>

        <aside
          id={BOOK_ID}
          className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start"
        >
          <BookingRequestForm
            kind="provision-order"
            subjectSlug={provision.slug}
            refId={provision.id}
            unitPrice={provision.price}
            pricing="per-unit"
            subtitleKey="Provision"
          />
        </aside>
      </Container>

      <StickyBookBar
        price={formatMoney(provision.price, locale)}
        unitLabel={unitLabel}
        targetId={BOOK_ID}
      />
    </>
  );
}
