import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Monogram } from "@/components/ui/Monogram";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Locale, Review } from "@/lib/types";
import { formatDate, t as pick } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= rating ? "fill-sand text-sand" : "text-ink-faint/40"}
        />
      ))}
    </span>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("reviews");

  if (reviews.length === 0) return null;

  return (
    <section>
      <SectionLabel>{t("title")}</SectionLabel>

      {/* one swipeable row on a phone, a grid from sm up */}
      <div className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="flex w-[85vw] shrink-0 snap-center flex-col rounded-card border border-ink/8 bg-paper p-5 sm:w-auto"
          >
            <div className="flex items-center gap-3">
              <Monogram name={review.author} className="size-10 text-lg" />
              <div className="min-w-0">
                <p className="truncate text-[0.95rem] font-medium text-ink">
                  {review.author}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-[0.75rem] text-ink-faint">
                  <Stars rating={review.rating} />
                  {formatDate(review.date, locale)}
                </p>
              </div>
            </div>

            {review.booked ? (
              <p className="mt-3 text-[0.78rem] text-ink-faint">
                {t("booked")}: {pick(review.booked, locale)}
              </p>
            ) : null}

            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
              {pick(review.text, locale)}
            </p>

            {review.reply ? (
              <div className="mt-4 rounded-xl border-l-2 border-clay-400 bg-cream-dim px-4 py-3">
                <p className="label-caps text-ink-faint">{t("ownerReply")}</p>
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-soft">
                  {pick(review.reply, locale)}
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
