import { useTranslations } from "next-intl";

/**
 * A slow band of place names. The list is rendered twice so the -50%
 * translate loops seamlessly; the second copy is aria-hidden so a screen
 * reader doesn't read every place twice.
 */
function Row({ places, hidden }: { places: string[]; hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
    >
      {places.map((place, i) => (
        <li
          key={`${place}-${i}`}
          className="flex items-center gap-10 whitespace-nowrap font-serif text-2xl text-ink/35 sm:gap-14 sm:text-3xl"
        >
          {place}
          <span className="size-1.5 rounded-full bg-clay-400/60" />
        </li>
      ))}
    </ul>
  );
}

export function PlaceMarquee() {
  const t = useTranslations("home");
  const places = t("marquee")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-cream-dim py-6">
      <div className="marquee-track flex w-max">
        <Row places={places} />
        <Row places={places} hidden />
      </div>
    </div>
  );
}
