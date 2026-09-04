import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Excursion, Locale } from "@/lib/types";
import { formatMoney, t as pick } from "@/lib/utils";

export function ExcursionCard({ excursion }: { excursion: Excursion }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <Link
      href={`/explore/${excursion.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink/8 bg-paper transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(60,30,15,0.5)]"
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <Image
          src={excursion.photos[0].src}
          alt={pick(excursion.photos[0].alt, locale)}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.8} />
            {t("explore.duration", { hours: excursion.durationHours })}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} strokeWidth={1.8} />
            {t("explore.groupUpTo", { count: excursion.groupMax })}
          </span>
        </div>

        <h3 className="font-serif text-xl leading-snug text-ink">
          {pick(excursion.name, locale)}
        </h3>
        <p className="line-clamp-3 text-[0.9rem] leading-relaxed text-ink-soft">
          {pick(excursion.summary, locale)}
        </p>

        <p className="mt-auto pt-3 text-[0.9rem]">
          <span className="font-semibold text-ink">
            {formatMoney(excursion.pricePerPerson, locale)}
          </span>{" "}
          <span className="text-ink-faint">{t("explore.perPerson")}</span>
        </p>
      </div>
    </Link>
  );
}
