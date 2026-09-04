"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/stay", key: "stay" },
  { href: "/village", key: "village" },
  { href: "/cars", key: "cars" },
  { href: "/rent", key: "rent" },
  { href: "/explore", key: "explore" },
] as const;

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Routes that open on a full-bleed photograph, so the bar can start
  // transparent. Detail pages are excluded on purpose: they open on a gallery
  // that may be a light product tile, where pale nav text would vanish.
  const photoTopped =
    pathname === "/" ||
    ["/stay", "/village", "/cars", "/rent", "/explore"].includes(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over a photograph the bar is transparent with light text.
  const overHero = photoTopped && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        overHero
          ? "border-b border-transparent bg-transparent"
          : // solid, not /92 — a section heading scrolling under the bar was
            // ghosting through the translucent version and reading as clipped
            "border-b border-ink/10 bg-cream shadow-[0_1px_12px_-4px_rgba(29,19,14,0.15)]",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" className="leading-none" onClick={() => setOpen(false)}>
          <span
            className={cn(
              "block font-serif text-[1.55rem] italic tracking-tight transition-colors duration-500 sm:text-[1.8rem]",
              overHero ? "text-cream" : "text-ink",
            )}
          >
            {t("brand.name")}
          </span>
          <span
            className={cn(
              "label-caps block transition-colors duration-500",
              overHero ? "text-cream/65" : "text-ink-faint",
            )}
          >
            {t("brand.kicker")}
          </span>
        </Link>

        {/* five entries + switcher — needs lg to sit on one line */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-[0.92rem] transition-colors duration-300",
                  overHero
                    ? cn(
                        "text-cream/85 hover:bg-cream/12 hover:text-cream",
                        active && "bg-cream/15 text-cream",
                      )
                    : cn(
                        "text-ink-soft hover:bg-ink/5 hover:text-ink",
                        active && "bg-ink/8 text-ink",
                      ),
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
          <span
            className={cn(
              "mx-2 h-5 w-px transition-colors duration-500",
              overHero ? "bg-cream/25" : "bg-ink/12",
            )}
          />
          <LocaleSwitcher onDark={overHero} />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t("common.close") : "Menu"}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-500 lg:hidden",
            overHero
              ? "border-cream/35 text-cream"
              : "border-ink/15 text-ink",
          )}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-ink/8 bg-cream lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-serif text-2xl text-ink hover:bg-ink/5"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="mt-3 border-t border-ink/8 pt-4">
              <LocaleSwitcher />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
