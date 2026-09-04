import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onClay" | "glass" | "night";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-clay-400 disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary:
    "bg-clay-500 text-cream shadow-[0_10px_28px_-14px_rgba(194,86,44,0.9)] " +
    "hover:bg-clay-600 hover:shadow-[0_14px_34px_-14px_rgba(194,86,44,0.95)]",
  secondary:
    "border border-ink/15 bg-paper text-ink hover:border-ink/35 hover:bg-cream-dim",
  ghost: "text-ink hover:bg-ink/5",
  onClay: "bg-cream text-clay-800 hover:bg-paper",
  // over photography
  glass:
    "border border-cream/30 bg-cream/10 text-cream backdrop-blur-md hover:bg-cream/20 hover:border-cream/50",
  night: "bg-night text-cream hover:bg-night-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
