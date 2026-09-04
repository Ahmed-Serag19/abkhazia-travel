"use client";

import { useEffect } from "react";

/**
 * Layer 3 — the last resort.
 *
 * Replaces the whole document when the root layout itself fails, so it cannot
 * rely on the layout's fonts, providers or translations. Everything here is
 * inline and hard-coded in both languages on purpose: if next-intl is what
 * broke, `useTranslations` would throw again and the user would get a blank
 * screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[render] global error", { digest: error.digest, error });
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#faf4e8",
          color: "#1d130e",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "26rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#94806f",
            }}
          >
            Casa Colina
          </p>

          <h1
            style={{
              margin: "0.9rem 0 0",
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: "1.8rem",
              lineHeight: 1.15,
              fontWeight: 400,
            }}
          >
            Сайт не отвечает
          </h1>
          <p
            style={{
              margin: "0.9rem 0 0",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#5f4a3c",
            }}
          >
            Произошла ошибка, из-за которой страница не может быть показана.
            Перезагрузите страницу.
          </p>
          <p
            style={{
              margin: "0.4rem 0 0",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              color: "#94806f",
            }}
          >
            An error stopped this page from being shown. Please reload.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.6rem",
              height: "2.9rem",
              padding: "0 1.6rem",
              borderRadius: "999px",
              border: "none",
              background: "#c2562c",
              color: "#faf4e8",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Перезагрузить / Reload
          </button>

          {error.digest ? (
            <p
              style={{
                marginTop: "1.6rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.7rem",
                color: "#94806f",
              }}
            >
              {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
