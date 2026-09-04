import { cn } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  lead,
  className,
  onClay = false,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  className?: string;
  onClay?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {kicker ? (
        <p
          className={cn(
            "label-caps mb-3",
            onClay ? "text-cream/70" : "text-ink-faint",
          )}
        >
          {kicker}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-serif text-[1.75rem] leading-tight tracking-tight sm:text-4xl",
          onClay ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-3 text-[0.98rem] leading-relaxed sm:text-lg",
            onClay ? "text-cream/80" : "text-ink-soft",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
