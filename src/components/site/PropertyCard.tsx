import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/Chip";
import type { Locale, PropertySummary } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

export function PropertyCard({ property }: { property: PropertySummary }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <Link
      href={`/stay/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink/8 bg-paper transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(60,30,15,0.5)]"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={property.cover.src}
          alt={pick(property.cover.alt, locale)}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3">
          <Chip tone={property.kind === "compound" ? "clay" : "blush"}>
            {t(`stay.kind.${property.kind}`)}
          </Chip>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl leading-snug text-ink">
            {pick(property.name, locale)}
          </h3>
          {property.rating ? (
            <span className="mt-1 flex shrink-0 items-center gap-1 text-[0.82rem] text-ink-soft">
              <Star size={13} className="fill-sand text-sand" />
              {property.rating.toFixed(1)}
              <span className="text-ink-faint">({property.reviewCount})</span>
            </span>
          ) : null}
        </div>

        <p className="flex items-center gap-1.5 text-[0.82rem] text-ink-faint">
          <MapPin size={13} strokeWidth={1.8} />
          {pick(property.location.area, locale)},{" "}
          {pick(property.location.region, locale)}
        </p>

        <p className="line-clamp-2 text-[0.9rem] leading-relaxed text-ink-soft">
          {pick(property.tagline, locale)}
        </p>

        <p className="mt-auto pt-3 text-[0.9rem] text-ink-soft">
          {t("common.from")}{" "}
          <span className="font-semibold text-ink">
            {formatMoney(property.fromPrice, locale)}
          </span>{" "}
          <span className="text-ink-faint">
            {property.priceUnit === "night"
              ? t("stay.priceUnitNight")
              : t("stay.priceUnitPerson")}
          </span>
        </p>
      </div>
    </Link>
  );
}
