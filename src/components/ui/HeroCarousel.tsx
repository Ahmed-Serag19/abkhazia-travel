"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "./Gallery";

/**
 * The photograph a detail page opens on.
 *
 * Full-bleed and tall on a phone with the title sitting on the image, so the
 * name of the place is visible without scrolling; a contained, rounded
 * 16:9 frame from `sm` up. Native scroll-snap rather than a carousel library —
 * it behaves better under a thumb.
 */
export function HeroCarousel({
  photos,
  children,
  className,
}: {
  photos: GalleryPhoto[];
  /** overlay content — title, location, rating */
  children?: React.ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(photos.length - 1, Math.max(0, index)));
  }, [photos.length]);

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  if (photos.length === 0) return null;

  return (
    <div
      className={cn(
        "relative -mx-5 overflow-hidden bg-night sm:mx-0 sm:rounded-card",
        className,
      )}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <div
            key={`${photo.src}-${i}`}
            className="relative h-[56svh] w-full shrink-0 snap-center sm:aspect-16/9 sm:h-auto"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* scrim only where the overlay sits */}
      {children ? (
        <div className="scrim-card pointer-events-none absolute inset-0" />
      ) : null}

      {photos.length > 1 ? (
        <span className="absolute right-4 top-4 rounded-full bg-night/55 px-2.5 py-1 text-[0.72rem] font-medium text-cream backdrop-blur-sm">
          {active + 1} / {photos.length}
        </span>
      ) : null}

      {children ? (
        <div className="absolute inset-x-0 bottom-0 p-5 pb-14 sm:p-7 sm:pb-16">
          {children}
        </div>
      ) : null}

      {photos.length > 1 ? (
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {photos.map((photo, i) => (
            <button
              key={`${photo.src}-dot-${i}`}
              type="button"
              aria-label={`${i + 1} / ${photos.length}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-cream" : "w-1.5 bg-cream/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
