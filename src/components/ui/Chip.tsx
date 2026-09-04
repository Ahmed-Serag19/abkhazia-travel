import { cn } from "@/lib/utils";

/** The rounded tag pills from the reference listing page. */
export function Chip({
  children,
  tone = "sage",
  className,
}: {
  children: React.ReactNode;
  tone?: "sage" | "blush" | "sand" | "clay" | "plain";
  className?: string;
}) {
  const tones = {
    sage: "bg-sage/45 text-ink",
    blush: "bg-blush/55 text-clay-800",
    sand: "bg-sand/50 text-ink",
    clay: "bg-clay-600 text-cream",
    plain: "border border-ink/12 bg-paper text-ink-soft",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8rem] font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
