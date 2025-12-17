/**
 * Deprecated: this project migrated from MongoDB/Mongoose to Postgres + Drizzle.
 * Use `marketAnalyses` from `@/lib/db/schema` instead.
 */

export { marketAnalyses } from '@/lib/db/schema';
export type {
  MarketAnalysisRow as IMarketAnalysis,
  NewMarketAnalysisRow as NewMarketAnalysis,
} from '@/lib/db/schema';
