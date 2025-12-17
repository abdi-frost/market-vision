/**
 * Cron Service - Handles data fetching, storage, and analysis
 */

import { fetchForexData } from '@/services/twelveData';
import { db } from '@/lib/db';
import { candles as candlesTable, marketAnalyses as marketAnalysesTable } from '@/lib/db/schema';
import { and, desc, eq, inArray, lt, sql } from 'drizzle-orm';
import type { Candle as CandleType, Timeframe } from '@/types/analysis';

export interface ProcessingResult {
  symbol: string;
  timeframe: string;
  success: boolean;
  candlesStored: number;
  analysisStored: boolean;
  error?: string;
}

/**
 * Phase 1: sleep helper for pacing requests.
 * We intentionally throttle between pairs to reduce load and avoid bursts.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalize symbols consistently across ingestion + DB queries.
 * Example: "USD/CAD" -> "USDCAD".
 */
function normalizeSymbol(symbol: string): string {
  return symbol.replace('/', '').toUpperCase();
}

/**
 * Phase 1 outputsize policy.
 * - First run: fetch ~30 days of candles so the DB starts with a useful window.
 * - Normal runs: fetch a smaller overlap window and rely on upsert dedupe.
 */
function getBootstrapMonthOutputsize(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1h':
      return 720; // 30 days * 24
    case '4h':
      return 180; // 30 days * 6
    case '1day':
      return 30;
    default:
      // Safe fallback that stays well within TwelveData's documented max (5000).
      return 200;
  }
}

function getNormalRunOutputsize(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1h':
      return 120;
    case '4h':
      return 60;
    case '1day':
      return 40;
    default:
      return 120;
  }
}

async function hasAnyCandles(symbol: string, timeframe: Timeframe): Promise<boolean> {
  const normalizedSymbol = normalizeSymbol(symbol);

  // We only need to know whether at least one candle exists.
  // Using `limit(1)` keeps this fast.
  const existing = await db
    .select({ id: candlesTable.id })
    .from(candlesTable)
    .where(and(eq(candlesTable.symbol, normalizedSymbol), eq(candlesTable.timeframe, timeframe)))
    .limit(1);

  return existing.length > 0;
}

/**
 * Store candle data in Postgres (Drizzle)
 */
export async function storeCandleData(
  symbol: string,
  timeframe: string,
  candles: CandleType[]
): Promise<number> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const now = new Date();

  const rows = candles.map((candle) => ({
    symbol: normalizedSymbol,
    timeframe,
    datetime: candle.datetime,
    timestamp: new Date(candle.datetime),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume ?? null,
    updatedAt: now,
  }));

  const upserted = await db
    .insert(candlesTable)
    .values(rows)
    .onConflictDoUpdate({
      target: [candlesTable.symbol, candlesTable.timeframe, candlesTable.datetime],
      set: {
        timestamp: sql`excluded.timestamp`,
        open: sql`excluded.open`,
        high: sql`excluded.high`,
        low: sql`excluded.low`,
        close: sql`excluded.close`,
        volume: sql`excluded.volume`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: candlesTable.id });

  return upserted.length;
}

/**
 * Store analysis results in Postgres (Drizzle)
 */
export async function storeAnalysisData(
  symbol: string,
  timeframe: string,
  // Intentionally typed as unknown in Phase 1.
  // Analysis is not run from /api/cron/update in Phase 1, but we keep this function
  // around for later phases.
  analysis: any,
  candleCount: number,
  lastCandleTime: string
): Promise<boolean> {
  try {
    const inserted = await db
      .insert(marketAnalysesTable)
      .values({
        symbol: normalizeSymbol(symbol),
        timeframe,
        analysis: {
          fvgs: analysis.fvgs,
          swingHigh: analysis.swingHigh,
          swingLow: analysis.swingLow,
          irlLevels: analysis.irlLevels,
          erlLevels: analysis.erlLevels,
          bias: analysis.bias,
        },
        metadata: {
          candleCount,
          lastCandleTime,
        },
        timestamp: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: marketAnalysesTable.id });

    return inserted.length > 0;
  } catch (error) {
    console.error(`Error storing analysis for ${symbol}:`, error);
    return false;
  }
}

/**
 * Process a single pair-timeframe combination
 */
export async function processPairTimeframe(
  symbol: string,
  timeframe: Timeframe,
  apiKey: string,
  outputsize: number
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    symbol,
    timeframe,
    success: false,
    candlesStored: 0,
    analysisStored: false,
  };

  try {
    // Step 1: Fetch data from TwelveData
    console.log(`[Cron] Fetching ${symbol} ${timeframe}...`);
    const candles = await fetchForexData(
      symbol,
      timeframe,
      apiKey,
      outputsize,
      false // Don't use mock data in cron
    );

    if (!candles || candles.length === 0) {
      result.error = 'No data returned from API';
      return result;
    }

    // Step 2: Store candle data
    console.log(`[Cron] Storing ${candles.length} candles for ${symbol} ${timeframe}...`);
    result.candlesStored = await storeCandleData(symbol, timeframe, candles);

    // NOTE (Phase 1): no analysis is run and no analysis is stored.
    // The /api/cron/update route is now focused on ingestion only.
    result.analysisStored = false;

    result.success = true;
    console.log(`[Cron] ✅ Completed ${symbol} ${timeframe}`);

    return result;
  } catch (error) {
    console.error(`[Cron] ❌ Error processing ${symbol} ${timeframe}:`, error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Phase 1: Ingest one pair/timeframe without doing analysis.
 * - Uses outputsize-based fetching only.
 * - If this is the first time we ingest this pair/timeframe, fetch ~1 month.
 */
export async function ingestPairTimeframe(
  symbol: string,
  timeframe: Timeframe,
  apiKey: string
): Promise<ProcessingResult> {
  const isFirstRun = !(await hasAnyCandles(symbol, timeframe));
  const outputsize = isFirstRun
    ? getBootstrapMonthOutputsize(timeframe)
    : getNormalRunOutputsize(timeframe);

  // Delegate to the existing fetch+store behavior, but keep it ingestion-only.
  const result: ProcessingResult = {
    symbol,
    timeframe,
    success: false,
    candlesStored: 0,
    analysisStored: false,
  };

  try {
    console.log(
      `[Cron][Phase1] Fetching ${symbol} ${timeframe} (outputsize=${outputsize}, firstRun=${isFirstRun})...`
    );

    const candles = await fetchForexData(symbol, timeframe, apiKey, outputsize, false);
    if (!candles || candles.length === 0) {
      result.error = 'No data returned from API';
      return result;
    }

    console.log(`[Cron][Phase1] Storing ${candles.length} candles for ${symbol} ${timeframe}...`);
    result.candlesStored = await storeCandleData(symbol, timeframe, candles);

    result.success = true;
    console.log(`[Cron][Phase1] ✅ Completed ingestion for ${symbol} ${timeframe}`);
    return result;
  } catch (error) {
    console.error(`[Cron][Phase1] ❌ Error ingesting ${symbol} ${timeframe}:`, error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Phase 1: Process pairs sequentially.
 * We intentionally pause 10s between pairs (not between timeframes)
 * to keep request rate low while UPDATE_PAIRS is small.
 */
export async function ingestPairsSequential(
  pairs: string[],
  timeframes: readonly Timeframe[],
  apiKey: string,
  pairDelayMs: number = 10_000
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  for (let pairIndex = 0; pairIndex < pairs.length; pairIndex += 1) {
    const symbol = pairs[pairIndex];
    console.log(`[Cron][Phase1] Processing pair ${pairIndex + 1}/${pairs.length}: ${symbol}`);

    for (const timeframe of timeframes) {
      const r = await ingestPairTimeframe(symbol, timeframe, apiKey);
      results.push(r);
    }

    // Pause between pairs (unless this is the last one).
    if (pairIndex < pairs.length - 1) {
      console.log(`[Cron][Phase1] Waiting ${pairDelayMs}ms before next pair...`);
      await sleep(pairDelayMs);
    }
  }

  return results;
}

/**
 * Process multiple pairs in batches to avoid rate limiting
 */
export async function processPairsBatch(
  pairs: string[],
  timeframes: readonly Timeframe[],
  apiKey: string,
  candleCounts: Record<string, number>,
  batchSize: number = 3,
  delayMs: number = 1000
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  // Create all pair-timeframe combinations
  const combinations: Array<{ symbol: string; timeframe: Timeframe }> = [];
  for (const symbol of pairs) {
    for (const timeframe of timeframes) {
      combinations.push({ symbol, timeframe });
    }
  }

  // Process in batches
  for (let i = 0; i < combinations.length; i += batchSize) {
    const batch = combinations.slice(i, i + batchSize);
    
    console.log(
      `[Cron] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        combinations.length / batchSize
      )}...`
    );

    // Process batch concurrently
    const batchResults = await Promise.all(
      batch.map(({ symbol, timeframe }) =>
        processPairTimeframe(
          symbol,
          timeframe,
          apiKey,
          candleCounts[timeframe] || 120
        )
      )
    );

    results.push(...batchResults);

    // Delay before next batch to avoid rate limiting
    if (i + batchSize < combinations.length) {
      console.log(`[Cron] Waiting ${delayMs}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Clean old data based on retention policy
 */
export async function cleanOldData(
  maxCandlesPerPair: number,
  maxAnalysesPerPair: number,
  deleteOlderThanDays: number
): Promise<{ candlesDeleted: number; analysesDeleted: number }> {
  let candlesDeleted = 0;
  let analysesDeleted = 0;

  try {
    // Get all unique symbol-timeframe combinations
    const candleCombinations = await db
      .selectDistinct({
        symbol: candlesTable.symbol,
        timeframe: candlesTable.timeframe,
      })
      .from(candlesTable);

    // Clean candles
    for (const { symbol, timeframe } of candleCombinations) {
      const idsToDelete = await db
        .select({ id: candlesTable.id })
        .from(candlesTable)
        .where(and(eq(candlesTable.symbol, symbol), eq(candlesTable.timeframe, timeframe)))
        .orderBy(desc(candlesTable.timestamp))
        .offset(maxCandlesPerPair);

      if (idsToDelete.length > 0) {
        await db
          .delete(candlesTable)
          .where(inArray(candlesTable.id, idsToDelete.map((r) => r.id)));
        candlesDeleted += idsToDelete.length;
      }
    }

    // Clean old analyses
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - deleteOlderThanDays);

    const cutoffDeleted = await db
      .delete(marketAnalysesTable)
      .where(lt(marketAnalysesTable.timestamp, cutoffDate))
      .returning({ id: marketAnalysesTable.id });
    analysesDeleted += cutoffDeleted.length;

    // Also limit analyses per pair
    const analysisCombinations = await db
      .selectDistinct({
        symbol: marketAnalysesTable.symbol,
        timeframe: marketAnalysesTable.timeframe,
      })
      .from(marketAnalysesTable);

    for (const { symbol, timeframe } of analysisCombinations) {
      const idsToDelete = await db
        .select({ id: marketAnalysesTable.id })
        .from(marketAnalysesTable)
        .where(
          and(
            eq(marketAnalysesTable.symbol, symbol),
            eq(marketAnalysesTable.timeframe, timeframe)
          )
        )
        .orderBy(desc(marketAnalysesTable.timestamp))
        .offset(maxAnalysesPerPair);

      if (idsToDelete.length > 0) {
        await db
          .delete(marketAnalysesTable)
          .where(inArray(marketAnalysesTable.id, idsToDelete.map((r) => r.id)));
        analysesDeleted += idsToDelete.length;
      }
    }

    console.log(
      `[Cron] Cleaned ${candlesDeleted} old candles and ${analysesDeleted} old analyses`
    );
  } catch (error) {
    console.error('[Cron] Error cleaning old data:', error);
  }

  return { candlesDeleted, analysesDeleted };
}
