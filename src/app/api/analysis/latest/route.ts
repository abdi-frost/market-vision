import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { marketAnalyses } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import {
  successResponse,
  handleApiError,
  createApiError,
  errorResponse,
} from '@/lib/api';

/**
 * GET /api/analysis/latest
 * 
 * Get the latest analysis for one or all pairs
 * 
 * Query params:
 * - symbol: (optional) Specific pair like "EURUSD" or "EUR/USD"
 * - timeframe: (optional) Specific timeframe like "1day" or "4h"
 * - limit: (optional) Number of analyses to return per pair (default: 1)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolParam = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe');
    const limit = parseInt(searchParams.get('limit') || '1', 10);

    // Normalize symbol (remove slash)
    const symbol = symbolParam?.replace('/', '').toUpperCase();

    const baseConditions: any[] = [];
    if (symbol) baseConditions.push(eq(marketAnalyses.symbol, symbol));
    if (timeframe) baseConditions.push(eq(marketAnalyses.timeframe, timeframe));

    // If requesting a specific symbol, return just that
    if (symbol) {
      const where = baseConditions.length ? and(...baseConditions) : undefined;
      const q = db
        .select()
        .from(marketAnalyses)
        .orderBy(desc(marketAnalyses.timestamp))
        .limit(limit);

      const analyses = where ? await q.where(where) : await q;

      if (analyses.length === 0) {
        return errorResponse(
          createApiError(
            `No analysis found for ${symbol}${timeframe ? ` (${timeframe})` : ''}`,
            'NOT_FOUND'
          )
        );
      }

      return successResponse(
        {
          symbol: symbolParam,
          timeframe,
          analyses,
          count: analyses.length,
        },
        {
          timestamp: new Date().toISOString(),
        }
      );
    }

    // Otherwise, return latest for all pairs
    const distinctQuery = db
      .selectDistinct({ symbol: marketAnalyses.symbol })
      .from(marketAnalyses);

    const allSymbols = baseConditions.length
      ? await distinctQuery.where(and(...baseConditions))
      : await distinctQuery;
    
    const latestAnalyses = await Promise.all(
      allSymbols.map(async ({ symbol: sym }) => {
        const conditions: any[] = [eq(marketAnalyses.symbol, sym)];
        if (timeframe) conditions.push(eq(marketAnalyses.timeframe, timeframe));

        const analyses = await db
          .select()
          .from(marketAnalyses)
          .where(and(...conditions))
          .orderBy(desc(marketAnalyses.timestamp))
          .limit(limit);
        
        return {
          symbol: sym,
          analyses,
        };
      })
    );

    // Filter out symbols with no analyses and format response
    const results = latestAnalyses
      .filter((item) => item.analyses.length > 0)
      .map((item) => ({
        symbol: item.symbol,
        timeframe: item.analyses[0]?.timeframe,
        latestAnalysis: item.analyses[0],
        allTimeframes: item.analyses,
        lastUpdated: item.analyses[0]?.timestamp,
      }));

    return successResponse(
      {
        pairs: results,
        count: results.length,
        timeframeFilter: timeframe || 'all',
      },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Failed to fetch latest analysis:', error);
    return handleApiError(error);
  }
}
