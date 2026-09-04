import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale, Localized, Money } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pick a localized string, falling back ru -> en -> ab. */
export function t(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.ru || value.en || value.ab || "";
}

const MONEY_LOCALE: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  ab: "ru-RU",
};

export function formatMoney(money: Money, locale: Locale): string {
  return new Intl.NumberFormat(MONEY_LOCALE[locale], {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(MONEY_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function nightsBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}
