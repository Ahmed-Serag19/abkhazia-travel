"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

/**
 * Phone-only action bar. On a small screen the price and the way to act on it
 * are otherwise several screens apart, so they follow you down the page.
 *
 * Appears once the first screen is behind you, and hides again over the
 * booking options themselves so it never covers the thing it points at.
 */
export function StickyBookBar({
  price,
  unitLabel,
  targetId,
}: {
  price: string;
  unitLabel: string;
  targetId: string;
}) {
  const t = useTranslations();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);

    const onScroll = () => {
      const pastFold = window.scrollY > window.innerHeight * 0.6;
      let overOptions = false;
      if (target) {
        const box = target.getBoundingClientRect();
        // the options are on screen — the bar would be in the way
        overOptions = box.top < window.innerHeight && box.bottom > 0;
      }
      setShown(pastFold && !overOptions);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur-md transition-transform duration-300 lg:hidden",
        shown ? "translate-y-0" : "translate-y-full",
      )}
      // keep it out of the tab order while it is off screen
      aria-hidden={!shown}
      inert={!shown || undefined}
    >
      <Container className="flex items-center justify-between gap-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="truncate font-serif text-xl leading-none text-ink">
            {price}
          </p>
          <p className="mt-1 truncate text-[0.75rem] text-ink-faint">
            {unitLabel}
          </p>
        </div>

        <a
          href={`#${targetId}`}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-clay-500 px-5 text-[0.95rem] font-medium text-cream transition-colors hover:bg-clay-600"
        >
          {t("booking.title")}
          <ArrowDown size={16} />
        </a>
      </Container>
    </div>
  );
}
