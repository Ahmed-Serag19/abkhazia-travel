import { cn } from "@/lib/utils";

/** Initial-letter avatar, used until a real portrait exists. */
export function Monogram({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toLocaleUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full bg-sea-100 font-serif text-sea-600",
        className,
      )}
    >
      {initial}
    </span>
  );
}
