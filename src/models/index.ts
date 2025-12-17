/**
 * Deprecated: this project migrated from MongoDB/Mongoose to Postgres + Drizzle.
 * Prefer importing from `@/lib/db/schema`.
 */

export { candles as Candle, marketAnalyses as MarketAnalysis } from '@/lib/db/schema';

export type { CandleRow as ICandle } from '@/lib/db/schema';
export type { MarketAnalysisRow as IMarketAnalysis } from '@/lib/db/schema';
