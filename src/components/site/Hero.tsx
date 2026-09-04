"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/photos/athos-bay.jpg", place: "athos" },
  { src: "/photos/ritsa-lake.jpg", place: "ritsa" },
  { src: "/photos/pitsunda-sea.jpg", place: "pitsunda" },
] as const;

const HOLD_MS = 7000;

export function Hero() {
  const t = useTranslations("home.hero");
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(true);

  // Stop advancing slides once the hero is scrolled past. Paired with
  // `.hero-paused` in globals.css, which parks the drift animation too.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onScreen) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      HOLD_MS,
    );
    return () => clearInterval(id);
  }, [onScreen]);

  const words = t("title").split(" ");

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative flex min-h-[92svh] flex-col overflow-hidden bg-night",
        !onScreen && "hero-paused",
      )}
    >
      {/* photo stack */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            aria-hidden={i !== active}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
              i === active ? "opacity-100" : "opacity-0",
            )}
          >
            {/* the drift runs continuously on every frame — see globals.css */}
            <div className="ken-burns absolute inset-0">
              <Image
                src={slide.src}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
        <div className="scrim-bottom absolute inset-0" />
      </div>

      {/* content */}
      <Container className="relative flex flex-1 flex-col justify-end pb-8 pt-28 sm:pb-12 sm:pt-32">
        <div className="max-w-3xl">
          <p className="label-caps flex items-center gap-3 text-cream/75">
            <span className="h-px w-8 bg-cream/40" />
            {t("kicker")}
          </p>

          <h1 className="mt-6 font-serif text-[2.4rem] leading-[1.05] tracking-tight text-cream sm:text-6xl lg:text-[4.6rem]">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="hero-word"
                style={
                  { "--word-delay": `${120 + i * 70}ms` } as React.CSSProperties
                }
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-balance text-[1.05rem] leading-relaxed text-cream/80 sm:text-lg">
            {t("lead")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/stay" variant="primary" size="lg">
              {t("ctaPrimary")}
              <ArrowRight size={17} />
            </ButtonLink>
            <ButtonLink href="/explore" variant="glass" size="lg">
              {t("ctaSecondary")}
            </ButtonLink>
          </div>
        </div>

        {/* slide control + scroll cue */}
        <div className="mt-12 flex items-end justify-between gap-6 border-t border-cream/15 pt-5">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={t(`places.${slide.place}`)}
                  aria-current={i === active}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === active
                      ? "w-10 bg-cream"
                      : "w-4 bg-cream/35 hover:bg-cream/60",
                  )}
                />
              ))}
            </div>
            <span className="label-caps text-cream/70">
              {t(`places.${SLIDES[active].place}`)}
            </span>
          </div>

          <span className="hidden items-center gap-2 text-cream/60 sm:flex">
            <span className="label-caps">{t("scroll")}</span>
            <ArrowDown size={15} className="float-hint" />
          </span>
        </div>
      </Container>
    </section>
  );
}
