import { NextRequest } from 'next/server';
import { successResponse, handleApiError, createApiError, errorResponse } from '@/lib/api';
import { ingestPairsSequential } from '@/services/cronService';
import { CRON_CONFIG } from '@/config/cron';

/**
 * POST /api/cron/update
 * 
 * Cron endpoint to fetch and store market data for multiple pairs
 * 
 * This endpoint should be called periodically (e.g., every 4 hours for 4h timeframe, daily for daily)
 * 
 * Security: Protect this endpoint with authentication in production!
 * You can use Vercel Cron Jobs or external cron services
 * 
 * Example with authorization header:
 * Authorization: Bearer YOUR_CRON_SECRET
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get API key
    const apiKey = process.env.TWELVE_API_KEY || 'demo_api_key';
    
    if (!apiKey || apiKey === 'demo_api_key') {
      return errorResponse(
        createApiError(
          'TWELVE_API_KEY not configured',
          'SERVICE_UNAVAILABLE',
          { hint: 'Set TWELVE_API_KEY in your environment variables' }
        )
      );
    }

    console.log('[Cron] Starting data update job...');
    console.log(`[Cron] Processing ${CRON_CONFIG.pairs.length} pairs with ${CRON_CONFIG.timeframes.length} timeframes`);

    // Phase 1: ingestion only.
    // - Process pairs sequentially.
    // - Wait 10 seconds between pairs.
    // - Do NOT run analysis or store analyses.
    // - Do NOT delete older data.
    const results = await ingestPairsSequential(
      CRON_CONFIG.pairs,
      CRON_CONFIG.timeframes,
      apiKey,
      10_000
    );

    // Calculate statistics
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalCandles = results.reduce((sum, r) => sum + r.candlesStored, 0);
    const totalAnalyses = 0;

    const duration = Date.now() - startTime;

    console.log('[Cron] ✅ Data update job completed');
    console.log(`[Cron] Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`[Cron] Success: ${successful}, Failed: ${failed}`);
    console.log(`[Cron] Candles stored: ${totalCandles}`);
    console.log(`[Cron] Analyses stored: ${totalAnalyses}`);

    return successResponse(
      {
        summary: {
          processed: results.length,
          successful,
          failed,
          totalCandlesStored: totalCandles,
          totalAnalysesStored: totalAnalyses,
          durationMs: duration,
        },
        cleanup: {
          candlesDeleted: 0,
          analysesDeleted: 0,
        },
        results: results.map((r) => ({
          symbol: r.symbol,
          timeframe: r.timeframe,
          success: r.success,
          candlesStored: r.candlesStored,
          analysisStored: r.analysisStored,
          error: r.error,
        })),
      },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('[Cron] ❌ Fatal error in cron job:', error);
    return handleApiError(error);
  }
}

/**
 * GET /api/cron/update
 * 
 * Get information about the cron job configuration
 */
export async function GET() {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const apiKey = process.env.TWELVE_API_KEY;

    return successResponse(
      {
        config: {
          pairs: CRON_CONFIG.pairs,
          timeframes: CRON_CONFIG.timeframes,
          candleCounts: CRON_CONFIG.candleCounts,
          retention: CRON_CONFIG.retention,
          totalCombinations:
            CRON_CONFIG.pairs.length * CRON_CONFIG.timeframes.length,
        },
        status: {
          cronSecretConfigured: !!cronSecret,
          apiKeyConfigured: !!apiKey && apiKey !== 'demo_api_key',
        },
        usage: {
          endpoint: '/api/cron/update',
          method: 'POST',
          headers: {
            Authorization: 'Bearer YOUR_CRON_SECRET',
          },
          description:
            'Fetches market data for all configured pairs and stores candles in Postgres (Phase 1: ingestion only)',
        },
      },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
