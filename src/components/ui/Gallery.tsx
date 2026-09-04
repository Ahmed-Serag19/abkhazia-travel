"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface GalleryPhoto {
  src: string;
  alt: string;
}

/**
 * Scroll-snap photo carousel with dots — the top element of a listing page.
 * No carousel library: native horizontal scrolling behaves better on touch.
 */
export function Gallery({
  photos,
  className,
  priority = false,
}: {
  photos: GalleryPhoto[];
  className?: string;
  priority?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
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
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className="relative aspect-4/3 w-full shrink-0 snap-center sm:aspect-16/9"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              aria-label={`${i + 1} / ${photos.length}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === active
                  ? "w-5 bg-cream"
                  : "w-2 bg-cream/55 hover:bg-cream/80",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
