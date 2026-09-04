import { cn } from "@/lib/utils";

/**
 * A standalone section heading on a content page — "About the place",
 * "Amenities", "Whole house", a Village category.
 *
 * The old treatment was an 11px faint-tan mono label doing a heading's job,
 * which read as a leftover rather than a divider. This keeps the typewriter
 * character but gives it a readable ink tone, a touch more size and a short
 * rule, so it looks deliberate.
 */
export function SectionLabel({
  children,
  as: Tag = "h2",
  className,
}: {
  children: React.ReactNode;
  as?: "h2" | "h3" | "p";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "label-caps flex items-center gap-3 text-[0.74rem] text-ink-soft",
        className,
      )}
    >
      <span className="h-px w-6 shrink-0 bg-clay-400" />
      {children}
    </Tag>
  );
}
