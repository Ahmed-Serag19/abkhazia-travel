import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The five ways in.
 *
 * Each tile leads with a 3D-render of one object — the picture is the icon,
 * there is no separate glyph. Art lives at `/public/icons/<key>.png`.
 * `object-cover` on `bg-cream-dim` so a cut-out render and a photo both sit on
 * the same warm ground.
 *
 * Hover is intentionally quiet: the card lifts a hair and the arrow nudges.
 * The image does NOT scale — the render already fills its frame, so any
 * zoom just crops it and reads as the subject "growing out of the box".
 */
const CATEGORIES = [
  { href: "/stay", key: "stay" },
  { href: "/village", key: "village" },
  { href: "/cars", key: "cars" },
  { href: "/rent", key: "rent" },
  { href: "/explore", key: "explore" },
] as const;

export function CategoryShowcase() {
  const t = useTranslations("home.categories");

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {CATEGORIES.map(({ href, key }, i) => (
        <Reveal key={href} delay={i * 80}>
          <Link
            href={href}
            className="group flex h-full flex-col overflow-hidden rounded-card border border-ink/8 bg-paper transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-24px_rgba(29,19,14,0.35)]"
          >
            <div className="relative aspect-square overflow-hidden bg-cream-dim">
              <span className="label-caps absolute left-3.5 top-3.5 z-10 text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Image
                src={`/icons/${key}.png`}
                alt=""
                fill
                sizes="(min-width: 1024px) 20vw, 45vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="font-serif text-lg leading-tight text-ink sm:text-xl">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-1.5 text-[0.8rem] leading-snug text-ink-soft sm:text-[0.86rem]">
                {t(`${key}.desc`)}
              </p>
              <ArrowUpRight
                size={17}
                className="mt-3 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-clay-500"
              />
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
