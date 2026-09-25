/**
 * One database query at a time, per process.
 *
 * WHY THIS EXISTS
 *
 * postgres.js pipelines: when a query is issued on a connection that is
 * already waiting for a reply, it sends it anyway and matches the responses
 * up afterwards. Against a normal Postgres that is a feature and it is fast.
 * Against Supabase's *transaction* pooler it is broken, and it breaks
 * silently in two different ways:
 *
 *   - the connection stops answering, with no error and no timeout, so the
 *     request hangs until the browser gives up; or
 *   - the rows from one query come back as the result of another. That one
 *     is worse. It surfaced here as an excursion whose `photos` array was a
 *     seller's — `photos[0].src` on undefined — and it killed a build on a
 *     different page every time it ran.
 *
 * A larger pool does not fix it, it only makes it rarer and less repeatable:
 * `next build` runs eleven worker processes, each with its own pool, against
 * a pooler that allows fifteen connections in total.
 *
 * So: a promise chain. Every database call waits for the previous one to
 * settle. No two queries are ever in flight on this process at once, which
 * means nothing is ever pipelined, whatever the pool size or how many
 * segments React decides to render concurrently.
 *
 * THE COST is real and worth stating: queries that could have overlapped now
 * add up. Measured against this database from a laptop in Egypt, ten
 * sequential queries take 550 ms against 417 ms concurrent — and the 417 ms
 * version is the one that sometimes returns the wrong rows. From a function
 * in the same region as the database the gap is a few milliseconds.
 *
 * If the site ever outgrows this, the fix is not to remove the lock: it is
 * the session-mode pooler (port 5432), or fewer, wider queries.
 */

let chain: Promise<unknown> = Promise.resolve();

export function serialize<T>(work: () => Promise<T>): Promise<T> {
  // `.then(work, work)` rather than `.then(work)`: a rejected predecessor
  // must not stop the queue, or one failed read deadlocks the process.
  const result = chain.then(work, work);
  chain = result.catch(() => undefined);
  return result;
}
