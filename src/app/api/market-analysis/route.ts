import { NextRequest } from "next/server";
import { fetchForexData } from "@/services/twelveData";
import { analyzeMarketStructure } from "@/algorithms/fvgAnalysis";
import { successResponse, handleApiError, createApiError, errorResponse } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol") || "EUR/USD";
    const interval = searchParams.get("interval") || "1day";

    // Determine output size based on interval (4× more data for better analysis)
    // Daily: 120 days (4 months)
    // 4H: 168 candles (4 weeks)
    const outputsize = interval === "4h" ? 168 : 120;

    // Get API key from environment variable
    const apiKey = process.env.TWELVE_API_KEY || "demo_api_key";
    const isProduction = process.env.NODE_ENV === "production";
    const isDemoKey = !apiKey || apiKey.includes("demo") || apiKey.includes("test");

    // Fetch candle data (with server-side caching)
    const data = await fetchForexData(symbol, interval, apiKey, outputsize);

    if (!data || data.length === 0) {
      return errorResponse(
        createApiError("No data available for analysis", "NOT_FOUND")
      );
    }

    // Perform market structure analysis
    const analysis = analyzeMarketStructure(data);

    const response = successResponse(
      {
        symbol,
        interval,
        data,
        analysis: {
          fvgs: analysis.fvgs,
          swingHigh: analysis.swingHigh,
          swingLow: analysis.swingLow,
          irlLevels: analysis.irlLevels,
          erlLevels: analysis.erlLevels,
          bias: analysis.bias,
        },
        usingMockData: !isProduction && isDemoKey,
      },
      {
        timestamp: new Date().toISOString(),
      }
    );

    // Add cache headers for browser caching (5 minutes)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Failed to perform market analysis:", error);
    return handleApiError(error);
  }
}
