import { Container } from "@/components/ui/Container";

/**
 * Layer 4 — the wait.
 *
 * Streamed in while a server component's data reads resolve. Shaped roughly
 * like the pages it stands in for, so the layout does not jump when the real
 * content lands.
 */
function Block({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-ink/8 ${className ?? ""}`}
      aria-hidden
    />
  );
}

export default function Loading() {
  return (
    <Container className="py-10 sm:py-14">
      <span className="sr-only" role="status">
        Loading
      </span>

      <Block className="h-[42svh] w-full rounded-card sm:h-[48svh]" />

      <div className="mt-6 flex gap-2">
        <Block className="h-7 w-28" />
        <Block className="h-7 w-40" />
        <Block className="h-7 w-32" />
      </div>

      <Block className="mt-6 h-10 w-3/4 max-w-md" />
      <Block className="mt-3 h-5 w-1/2 max-w-sm" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Block className="aspect-4/3 w-full rounded-card" />
            <Block className="h-5 w-2/3" />
            <Block className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Container>
  );
}
