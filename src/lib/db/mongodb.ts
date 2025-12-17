/**
 * Deprecated: this project migrated from MongoDB/Mongoose to Postgres + Drizzle.
 *
 * Keep this file as a stub so older imports fail loudly at runtime rather than
 * breaking TypeScript builds.
 */
export default async function connectDB(): Promise<never> {
  throw new Error(
    'MongoDB connector removed. Use `db` from `@/lib/db` (Postgres + Drizzle) instead.'
  );
}
