import {
  Apple,
  Bike,
  Car,
  Croissant,
  Egg,
  Hexagon,
  Milk,
  Soup,
  Tent,
  Umbrella,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProvisionCategory, RentalCategory } from "@/lib/types";

/**
 * Stand-in artwork for products we have no photograph of yet.
 *
 * A tinted panel with a large category mark reads as a deliberate design
 * choice; a mismatched stock photo does not. When real photography arrives,
 * populate `photos` on the item and the image takes over automatically.
 */

const PROVISION_ICON: Record<ProvisionCategory, LucideIcon> = {
  dairy: Milk,
  eggs: Egg,
  honey: Hexagon,
  produce: Apple,
  bakery: Croissant,
  preserves: Soup,
};

const RENTAL_ICON: Record<RentalCategory, LucideIcon> = {
  car: Car,
  water: Waves,
  beach: Umbrella,
  camping: Tent,
  bike: Bike,
};

const PROVISION_TONE: Record<ProvisionCategory, string> = {
  dairy: "bg-sea-50 text-sea-500",
  eggs: "bg-sand/45 text-clay-700",
  honey: "bg-sand/70 text-clay-800",
  produce: "bg-sage/40 text-sea-600",
  bakery: "bg-clay-100 text-clay-700",
  preserves: "bg-blush/60 text-clay-800",
};

const RENTAL_TONE: Record<RentalCategory, string> = {
  car: "bg-clay-100 text-clay-700",
  water: "bg-sea-100 text-sea-600",
  beach: "bg-sand/55 text-clay-700",
  camping: "bg-sage/45 text-sea-600",
  bike: "bg-sea-50 text-sea-500",
};

export function ProductTile({
  kind,
  category,
  size = "card",
  className,
}: {
  kind: "provision" | "rental";
  category: ProvisionCategory | RentalCategory;
  size?: "card" | "thumb" | "hero";
  className?: string;
}) {
  const Icon =
    kind === "provision"
      ? PROVISION_ICON[category as ProvisionCategory]
      : RENTAL_ICON[category as RentalCategory];
  const tone =
    kind === "provision"
      ? PROVISION_TONE[category as ProvisionCategory]
      : RENTAL_TONE[category as RentalCategory];

  const iconSize = size === "hero" ? 88 : size === "card" ? 46 : 26;

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        tone,
        className,
      )}
    >
      {/* faint repeating rule, so the panel has texture rather than flat fill */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 11px)",
        }}
      />
      <Icon
        size={iconSize}
        strokeWidth={1.15}
        className="relative opacity-80"
      />
    </div>
  );
}
