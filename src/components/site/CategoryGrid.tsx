import { useTranslations } from "next-intl";
import { Car, Compass, House, Wheat } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * The four entry tiles from the mockup: cream cards on the clay ground,
 * each with a tinted accent circle and a typewriter label.
 */
const CATEGORIES = [
  { href: "/stay", key: "stay", Icon: House, circle: "bg-blush", ink: "text-clay-700" },
  { href: "/explore", key: "explore", Icon: Compass, circle: "bg-sage/70", ink: "text-spruce" },
  { href: "/rent", key: "rent", Icon: Car, circle: "bg-sage/50", ink: "text-ink" },
  { href: "/village", key: "village", Icon: Wheat, circle: "bg-sand", ink: "text-clay-700" },
] as const;

export function CategoryGrid() {
  const t = useTranslations("home.categories");

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {CATEGORIES.map(({ href, key, Icon, circle, ink }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center gap-4 rounded-card bg-paper p-5 text-center shadow-[0_10px_30px_-18px_rgba(60,30,15,0.55)] transition-transform duration-200 hover:-translate-y-1 sm:p-7"
        >
          <span
            className={`flex size-16 items-center justify-center rounded-full sm:size-20 ${circle}`}
          >
            <Icon className={ink} size={26} strokeWidth={1.6} />
          </span>
          <span className="label-caps text-ink">{t(`${key}.title`)}</span>
          <span className="text-[0.82rem] leading-snug text-ink-faint sm:text-sm">
            {t(`${key}.desc`)}
          </span>
        </Link>
      ))}
    </div>
  );
}
