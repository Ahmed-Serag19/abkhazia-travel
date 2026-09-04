"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BookingRequestForm, type Pricing } from "./BookingRequestForm";
import type { BookingKind, Locale, Money, Photo } from "@/lib/types";
import { cn, formatMoney, t as pick } from "@/lib/utils";

/**
 * One bookable line item — a whole house in a compound, or a per-person room
 * in a hosted property. Collapsed by default; expands into a request form.
 */
export function BookableOption({
  name,
  description,
  facts,
  photos,
  price,
  priceUnitLabel,
  amenities,
  kind,
  subjectSlug,
  refId,
  pricing,
  note,
}: {
  name: string;
  description: string;
  facts: string[];
  photos: Photo[];
  price: Money;
  priceUnitLabel: string;
  amenities: string[];
  kind: BookingKind;
  subjectSlug: string;
  refId: string;
  pricing: Pricing;
  note?: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const tAmenity = useTranslations("amenities");
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-card border border-ink/10 bg-paper">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        {photos[0] ? (
          <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl sm:aspect-square sm:w-40">
            <Image
              src={photos[0].src}
              alt={pick(photos[0].alt, locale)}
              fill
              sizes="(min-width: 640px) 160px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-serif text-xl text-ink">{name}</h3>
            <p className="text-[0.95rem]">
              <span className="font-semibold text-ink">
                {formatMoney(price, locale)}
              </span>{" "}
              <span className="text-ink-faint">{priceUnitLabel}</span>
            </p>
          </div>

          {note ? (
            <p className="label-caps text-ink-faint">{note}</p>
          ) : null}

          <p className="text-[0.9rem] leading-relaxed text-ink-soft">
            {description}
          </p>

          {facts.length ? (
            <p className="text-[0.82rem] text-ink-faint">
              {facts.join(" · ")}
            </p>
          ) : null}

          {amenities.length ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {amenities.slice(0, 5).map((key) => (
                <Chip key={key} tone="plain" className="text-[0.7rem]">
                  {tAmenity(key)}
                </Chip>
              ))}
            </div>
          ) : null}

          <Button
            type="button"
            variant={open ? "secondary" : "primary"}
            size="sm"
            className="mt-3 self-start"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t("common.close") : t("booking.title")}
            <ChevronDown
              size={15}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-cream/60 p-4 sm:p-5">
          <BookingRequestForm
            kind={kind}
            subjectSlug={subjectSlug}
            refId={refId}
            unitPrice={price}
            pricing={pricing}
            subtitleKey="Stay"
            className="mx-auto max-w-lg"
          />
        </div>
      ) : null}
    </div>
  );
}
