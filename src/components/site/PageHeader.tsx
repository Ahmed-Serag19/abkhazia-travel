import Image from "next/image";
import { Container } from "@/components/ui/Container";

/**
 * Photographic header for the four section pages.
 *
 * It pulls itself up under the fixed site header with a negative margin and
 * pads the content back down, so the photograph runs edge to edge and behind
 * the nav — the same trick the home hero uses.
 */
export function PageHeader({
  photo,
  kicker,
  title,
  lead,
  children,
}: {
  photo: string;
  kicker: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative -mt-16 flex min-h-[58svh] flex-col justify-end overflow-hidden bg-night pt-16 sm:-mt-20 sm:min-h-[52svh] sm:pt-20">
      <Image
        src={photo}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="scrim-bottom absolute inset-0" />

      <Container className="relative pb-9 pt-10 sm:pb-12">
        <p className="label-caps flex items-center gap-3 text-cream/70">
          <span className="h-px w-6 bg-cream/40" />
          {kicker}
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-[2.1rem] leading-[1.1] text-cream sm:text-5xl">
          {title}
        </h1>
        {lead ? (
          <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-cream/80 sm:text-lg">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </section>
  );
}
