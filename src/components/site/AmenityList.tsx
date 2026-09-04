import { useTranslations } from "next-intl";
import {
  AirVent,
  Armchair,
  Bath,
  CircleParking,
  Coffee,
  Compass,
  DoorOpen,
  Fan,
  Flame,
  Shirt,
  ShowerHead,
  Sprout,
  Utensils,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  kitchen: Utensils,
  parking: CircleParking,
  wifi: Wifi,
  washer: WashingMachine,
  terrace: Armchair,
  garden: Sprout,
  sea_view: Waves,
  bbq: Flame,
  breakfast: Coffee,
  shared_kitchen: Utensils,
  host_guiding: Compass,
  laundry_service: Shirt,
  private_bath: ShowerHead,
  shared_bath: Bath,
  garden_entrance: DoorOpen,
  ac: AirVent,
  fan: Fan,
  river_access: Waves,
};

/** Amenities read far faster with a mark against each one. */
export function AmenityList({
  amenities,
  className,
}: {
  amenities: string[];
  className?: string;
}) {
  const t = useTranslations("amenities");

  return (
    <ul className={cn("grid grid-cols-2 gap-x-5 gap-y-3.5 sm:grid-cols-3", className)}>
      {amenities.map((key) => {
        const Icon = ICONS[key];
        return (
          <li key={key} className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sea-50 text-sea-500">
              {Icon ? <Icon size={15} strokeWidth={1.8} /> : null}
            </span>
            <span className="text-[0.88rem] leading-snug text-ink-soft">
              {t(key)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
