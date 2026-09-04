import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getData } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Monogram } from "@/components/ui/Monogram";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/site/PageHeader";
import { ProvisionCard } from "@/components/site/ProvisionCard";
import type { Locale, ProvisionCategory } from "@/lib/types";
import { t as pick } from "@/lib/utils";

const CATEGORY_ORDER: ProvisionCategory[] = [
  "dairy",
  "eggs",
  "honey",
  "produce",
  "bakery",
  "preserves",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "village" });
  return { title: t("title"), description: t("lead") };
}

export default async function VillagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;

  const t = await getTranslations();
  const data = getData();
  const [provisions, sellers] = await Promise.all([
    data.listProvisions(),
    data.listSellers(),
  ]);
  const sellerById = new Map(sellers.map((s) => [s.id, s]));

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: provisions.filter((p) => p.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        photo="/photos/boxwood-forest.jpg"
        kicker={t("brand.kicker")}
        title={t("village.title")}
        lead={t("village.lead")}
      />

      {/* who grows it */}
      <Container className="py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="flex gap-4 rounded-card border border-ink/8 bg-paper p-4"
            >
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
                <p className="font-serif text-lg leading-snug text-ink">
                  {pick(seller.name, locale)}
                </p>
                <p className="label-caps mt-1 text-ink-faint">
                  {pick(seller.location.area, locale)}
                </p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">
                  {pick(seller.about, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {groups.map(({ category, items }) => (
          <section key={category} className="mt-14 first:mt-16">
            <SectionLabel>{t(`village.category.${category}`)}</SectionLabel>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((provision, i) => (
                <Reveal key={provision.id} delay={i * 70}>
                  <ProvisionCard
                    provision={provision}
                    seller={sellerById.get(provision.sellerId)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
