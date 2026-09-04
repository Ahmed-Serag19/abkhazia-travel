import { useTranslations } from "next-intl";
import { CalendarCheck, HandCoins, Receipt } from "lucide-react";

/** The three reassurance callouts from the reference listing page. */
export function BenefitStrip() {
  const t = useTranslations("benefits");

  const items = [
    { Icon: HandCoins, title: t("bestPrice"), desc: t("bestPriceDesc") },
    { Icon: Receipt, title: t("noFees"), desc: t("noFeesDesc") },
    {
      Icon: CalendarCheck,
      title: t("freeCancellation"),
      desc: t("freeCancellationDesc"),
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {items.map(({ Icon, title, desc }) => (
        <li
          key={title}
          className="flex gap-3 rounded-card border border-ink/8 bg-paper p-4"
        >
          <Icon
            size={20}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-clay-600"
          />
          <div>
            <p className="text-[0.92rem] font-semibold text-ink">{title}</p>
            <p className="mt-1 text-[0.82rem] leading-snug text-ink-faint">
              {desc}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
