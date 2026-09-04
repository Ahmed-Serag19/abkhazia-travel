"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The header is fixed so it can sit transparently over the home hero.
 * Every other page therefore needs its height back as padding.
 */
export function Main({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === "/";
  return (
    <main className={cn("flex-1", !isHome && "pt-16 sm:pt-20")}>{children}</main>
  );
}
