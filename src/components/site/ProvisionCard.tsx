import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/Chip";
import { ProductTile } from "@/components/ui/ProductTile";
import type { Locale, Provision, Seller } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

export function ProvisionCard({
  provision,
  seller,
}: {
  provision: Provision;
  seller?: Seller;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <Link
      href={`/village/${provision.slug}`}
      className="group flex gap-4 rounded-card border border-ink/8 bg-paper p-3 transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(60,30,15,0.5)] sm:flex-col sm:p-0"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl sm:aspect-4/3 sm:size-auto sm:w-full sm:rounded-b-none sm:rounded-t-card">
        {provision.photos[0] ? (
          <Image
            src={provision.photos[0].src}
            alt={pick(provision.photos[0].alt, locale)}
            fill
            sizes="(min-width: 640px) 300px, 100px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ProductTile
            kind="provision"
            category={provision.category}
            size="card"
            className="relative transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="sand" className="text-[0.7rem]">
            {t(`village.category.${provision.category}`)}
          </Chip>
          {!provision.inStock ? (
            <Chip tone="plain" className="text-[0.7rem]">
              {t("common.outOfStock")}
            </Chip>
          ) : null}
        </div>

        <h3 className="font-serif text-lg leading-snug text-ink">
          {pick(provision.name, locale)}
        </h3>

        {seller ? (
          <p className="text-[0.8rem] text-ink-faint">
            {t("village.soldBy")} · {pick(seller.name, locale)}
          </p>
        ) : null}

        <p className="mt-auto pt-2 text-[0.9rem]">
          <span className="font-semibold text-ink">
            {formatMoney(provision.price, locale)}
          </span>{" "}
          <span className="text-ink-faint">
            {t("village.perUnit", { unit: pick(provision.unitLabel, locale) })}
          </span>
        </p>
      </div>
    </Link>
  );
}
