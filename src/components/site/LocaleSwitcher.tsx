"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ onDark = false }: { onDark?: boolean }) {
  const t = useTranslations("locale");
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5 transition-colors duration-500",
        onDark
          ? "border-cream/25 bg-cream/10 backdrop-blur-sm"
          : "border-ink/12 bg-paper",
        pending && "opacity-60",
      )}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-current={locale === active}
          onClick={() =>
            startTransition(() => router.replace(pathname, { locale }))
          }
          className={cn(
            "label-caps rounded-full px-3 py-1.5 transition-colors",
            locale === active
              ? onDark
                ? "bg-cream text-ink"
                : "bg-ink text-cream"
              : onDark
                ? "text-cream/75 hover:bg-cream/15"
                : "text-ink-soft hover:bg-ink/6",
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
