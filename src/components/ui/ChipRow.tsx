import { cn } from "@/lib/utils";

/**
 * Chips on one swipeable line instead of wrapping into a wall.
 *
 * Five highlight chips stacked into five rows on a 375px screen and pushed
 * the property name almost a full screen down — this keeps them to a single
 * scrollable row on mobile and lets them wrap normally from `sm` up.
 */
export function ChipRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // bleed to the screen edges on mobile so the row reads as scrollable
        "-mx-5 flex gap-2 overflow-x-auto px-5 pb-1",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
