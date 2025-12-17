/**
 * Deprecated: this project migrated from MongoDB/Mongoose to Postgres + Drizzle.
 * Use `candles` from `@/lib/db/schema` instead.
 */

export { candles } from '@/lib/db/schema';
export type { CandleRow as ICandle, NewCandleRow as NewCandle } from '@/lib/db/schema';
