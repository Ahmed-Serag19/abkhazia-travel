"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Layer 2 — the render that threw.
 *
 * Catches anything a page or its data reads throw below this segment. The
 * `reset()` retry matters: most failures here are a timed-out read, and a
 * second attempt usually works, so a person should not have to understand
 * what happened to get past it.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // In production this is where Sentry/Axiom would get it. The digest is
    // the only thing that correlates this screen with the server log.
    console.error("[render] segment error", { digest: error.digest, error });
  }, [error]);

  return (
    <Container className="flex min-h-[70svh] flex-col items-start justify-center py-20">
      <span className="flex size-12 items-center justify-center rounded-full bg-clay-100 text-clay-600">
        <TriangleAlert size={22} strokeWidth={1.8} />
      </span>

      <p className="label-caps mt-6 text-ink-faint">{t("kicker")}</p>
      <h1 className="mt-3 max-w-xl font-serif text-[1.9rem] leading-tight text-ink sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-ink-soft">
        {t("body")}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} size="lg">
          <RotateCw size={16} />
          {t("retry")}
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          {t("home")}
        </ButtonLink>
      </div>

      {error.digest ? (
        <p className="mt-8 font-mono text-[0.72rem] text-ink-faint">
          {t("reference")}: {error.digest}
        </p>
      ) : null}
    </Container>
  );
}
