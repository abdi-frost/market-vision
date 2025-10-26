import { NextRequest, NextResponse } from "next/server";
import { fetchForexData } from "@/services/twelveData";
import { analyzeMarketStructure } from "@/algorithms/fvgAnalysis";

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

    // Fetch candle data
    const data = await fetchForexData(symbol, interval, apiKey, outputsize);

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No data available for analysis",
        },
        { status: 404 }
      );
    }

    // Perform market structure analysis
    const analysis = analyzeMarketStructure(data);

    return NextResponse.json({
      success: true,
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
    });
  } catch (error) {
    console.error("Failed to perform market analysis:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform market analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
