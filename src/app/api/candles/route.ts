import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { candles } from '@/lib/db/schema';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import {
  successResponse,
  handleApiError,
  createApiError,
  errorResponse,
} from '@/lib/api';

/**
 * GET /api/candles
 * 
 * Get historical candle data for a specific pair
 * 
 * Query params:
 * - symbol: (required) Pair symbol like "EURUSD" or "EUR/USD"
 * - timeframe: (required) Timeframe like "1day" or "4h"
 * - limit: (optional) Number of candles to return (default: 100, max: 500)
 * - from: (optional) Start date in ISO format
 * - to: (optional) End date in ISO format
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolParam = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100', 10),
      500
    );
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Validate required parameters
    if (!symbolParam || !timeframe) {
      return errorResponse(
        createApiError(
          'Symbol and timeframe are required',
          'VALIDATION_ERROR',
          { required: ['symbol', 'timeframe'] }
        )
      );
    }

    // Normalize symbol (remove slash)
    const symbol = symbolParam.replace('/', '').toUpperCase();

    const conditions = [eq(candles.symbol, symbol), eq(candles.timeframe, timeframe)];
    if (from) conditions.push(gte(candles.timestamp, new Date(from)));
    if (to) conditions.push(lte(candles.timestamp, new Date(to)));

    const rows = await db
      .select({
        datetime: candles.datetime,
        open: candles.open,
        high: candles.high,
        low: candles.low,
        close: candles.close,
        volume: candles.volume,
        timestamp: candles.timestamp,
      })
      .from(candles)
      .where(and(...conditions))
      .orderBy(desc(candles.timestamp))
      .limit(limit);

    if (rows.length === 0) {
      return errorResponse(
        createApiError(
          `No candle data found for ${symbolParam} (${timeframe})`,
          'NOT_FOUND',
          { hint: 'Run the cron job first to populate data' }
        )
      );
    }

    // Reverse to get chronological order
    const chronological = [...rows].reverse();

    const formattedCandles = chronological.map((c) => ({
      datetime: c.datetime,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume ?? undefined,
    }));

    return successResponse(
      {
        symbol: symbolParam,
        timeframe,
        candles: formattedCandles,
        count: formattedCandles.length,
        range: {
          from: chronological[0]?.datetime,
          to: chronological[chronological.length - 1]?.datetime,
        },
      },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Failed to fetch candles:', error);
    return handleApiError(error);
  }
}
