import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/Chip";
import { ProductTile } from "@/components/ui/ProductTile";
import type { Locale, RentalItem } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

export function RentalCard({
  item,
  hrefBase = "/rent",
  showCategory = true,
}: {
  item: RentalItem;
  /** "/cars" for the car list, "/rent" for everything else */
  hrefBase?: "/rent" | "/cars";
  /** hide the category chip on the cars list, where it's the same on every card */
  showCategory?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <Link
      href={`${hrefBase}/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink/8 bg-paper transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(60,30,15,0.5)]"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {item.photos[0] ? (
          <Image
            src={item.photos[0].src}
            alt={pick(item.photos[0].alt, locale)}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ProductTile
            kind="rental"
            category={item.category}
            size="card"
            className="relative transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}
        {showCategory ? (
          <div className="absolute left-3 top-3">
            <Chip tone="sage" className="text-[0.7rem]">
              {t(`rent.category.${item.category}`)}
            </Chip>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h3 className="font-serif text-xl leading-snug text-ink">
          {pick(item.name, locale)}
        </h3>
        <p className="line-clamp-2 text-[0.9rem] leading-relaxed text-ink-soft">
          {pick(item.description, locale)}
        </p>

        {item.delivery ? (
          <p className="flex items-center gap-1.5 text-[0.8rem] text-ink-faint">
            <Truck size={13} strokeWidth={1.8} />
            {t("rent.deliveryYes")}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-[0.9rem]">
            <span className="font-semibold text-ink">
              {formatMoney(item.pricePerDay, locale)}
            </span>{" "}
            <span className="text-ink-faint">{t("rent.perDay")}</span>
          </p>
          <p className="text-[0.78rem] text-ink-faint">
            {t("rent.deposit")} {formatMoney(item.deposit, locale)}
          </p>
        </div>
      </div>
    </Link>
  );
}
