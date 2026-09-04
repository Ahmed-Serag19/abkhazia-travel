"use client";

import { useActionState, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import {
  submitBookingRequest,
  type BookingFormState,
} from "@/app/actions/booking";
import { Button } from "@/components/ui/Button";
import type { BookingKind, Locale, Money } from "@/lib/types";
import { cn, formatMoney, nightsBetween } from "@/lib/utils";

export type Pricing =
  | "per-night"
  | "per-person-night"
  | "per-day"
  | "per-person"
  | "per-unit";

const KNOWN_ERRORS = new Set([
  "too_short",
  "bad_email",
  "end_before_start",
]);

const initialState: BookingFormState = { status: "idle" };

export function BookingRequestForm({
  kind,
  subjectSlug,
  refId,
  unitPrice,
  pricing,
  subtitleKey,
  className,
}: {
  kind: BookingKind;
  subjectSlug: string;
  refId?: string;
  unitPrice: Money;
  pricing: Pricing;
  subtitleKey: "Stay" | "Rental" | "Excursion" | "Provision";
  className?: string;
}) {
  const t = useTranslations("booking");
  const locale = useLocale() as Locale;
  const [state, formAction, pending] = useActionState(
    submitBookingRequest,
    initialState,
  );

  // A rental or a food order counts items; a stay or an excursion counts people.
  const countsItems = kind === "rental" || kind === "provision-order";
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [count, setCount] = useState(countsItems ? 1 : 2);

  const wantsRange =
    pricing === "per-night" ||
    pricing === "per-person-night" ||
    pricing === "per-day";
  const wantsSingleDate = pricing === "per-person";

  const nights = nightsBetween(start, end);

  const estimate = useMemo<Money | null>(() => {
    switch (pricing) {
      case "per-night":
        return nights
          ? { ...unitPrice, amount: unitPrice.amount * nights }
          : null;
      case "per-person-night":
        return nights
          ? { ...unitPrice, amount: unitPrice.amount * nights * count }
          : null;
      case "per-day":
        return nights
          ? { ...unitPrice, amount: unitPrice.amount * nights * count }
          : null;
      case "per-person":
      case "per-unit":
        return { ...unitPrice, amount: unitPrice.amount * count };
    }
  }, [pricing, unitPrice, nights, count]);

  const errKey = (field: string) => {
    const raw = state.fieldErrors?.[field];
    if (!raw) return null;
    return KNOWN_ERRORS.has(raw) ? raw : "generic";
  };

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "rounded-card border border-sage bg-sage/25 p-6 text-center",
          className,
        )}
      >
        <CheckCircle2
          size={30}
          strokeWidth={1.6}
          className="mx-auto text-spruce"
        />
        <p className="mt-3 font-serif text-xl text-ink">{t("successTitle")}</p>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">
          {t("successBody")}
        </p>
        {DEMO ? (
          <p className="mt-4 border-t border-ink/10 pt-3 text-[0.78rem] leading-snug text-ink-faint">
            {t("demoNotice")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        "rounded-card border border-ink/10 bg-paper p-5 sm:p-6",
        className,
      )}
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="subjectSlug" value={subjectSlug} />
      {refId ? <input type="hidden" name="refId" value={refId} /> : null}
      <input type="hidden" name="locale" value={locale} />

      <p className="font-serif text-2xl text-ink">{t("title")}</p>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-faint">
        {t(`subtitle${subtitleKey}`)}
      </p>

      <div className="mt-5 space-y-3.5">
        {wantsRange ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("arrival")}>
              <input
                type="date"
                name="startDate"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={t("departure")} error={errKey("endDate")}>
              <input
                type="date"
                name="endDate"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        ) : null}

        {wantsSingleDate ? (
          <Field label={t("date")}>
            <input
              type="date"
              name="startDate"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
            />
          </Field>
        ) : null}

        <Field label={countsItems ? t("quantity") : t("guests")}>
          <input
            type="number"
            min={1}
            max={40}
            name={countsItems ? "quantity" : "guests"}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
            className={inputClass}
          />
        </Field>

        <Field label={t("name")} error={errKey("name")}>
          <input
            name="name"
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>

        <Field label={t("email")} error={errKey("email")}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </Field>

        <Field label={t("phone")} error={errKey("phone")}>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={inputClass}
          />
        </Field>

        <Field label={t("message")}>
          <textarea
            name="message"
            rows={3}
            placeholder={t("messagePlaceholder")}
            className={cn(inputClass, "h-auto resize-y py-2.5")}
          />
        </Field>
      </div>

      {estimate ? (
        <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-4">
          <div>
            <p className="font-serif text-2xl text-ink">
              {formatMoney(estimate, locale)}
            </p>
            <p className="text-[0.75rem] text-ink-faint">{t("estimateNote")}</p>
          </div>
          {nights > 0 ? (
            <p className="text-[0.82rem] text-ink-soft">
              {t("nightsSummary", { count: nights })}
            </p>
          ) : null}
        </div>
      ) : null}

      {state.error ? (
        <p className="mt-4 text-[0.85rem] text-clay-700">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="mt-5 w-full">
        {pending ? t("submitting") : t("submit")}
      </Button>

      {DEMO ? (
        <p className="mt-3 rounded-xl border border-sand bg-sand/25 px-3 py-2.5 text-[0.78rem] leading-snug text-ink-soft">
          {t("demoNotice")}
        </p>
      ) : null}
    </form>
  );
}

/**
 * The showcase deployment has no database, so a request submitted there is
 * logged and nothing more. Saying so is the difference between a demo and
 * quietly losing somebody's holiday booking.
 */
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const inputClass =
  "h-11 w-full rounded-xl border border-ink/15 bg-cream px-3 text-[0.95rem] text-ink " +
  "outline-none transition-colors placeholder:text-ink-faint focus:border-clay-400 " +
  "focus:ring-2 focus:ring-clay-300/40";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations("booking.errors");
  return (
    <label className="block">
      <span className="label-caps mb-1.5 block text-ink-faint">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.78rem] text-clay-700">
          {t(error)}
        </span>
      ) : null}
    </label>
  );
}
