import { NextRequest, NextResponse } from "next/server";
import { fetchForexData } from "@/services/twelveData";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol") || "EUR/USD";
    const interval = searchParams.get("interval") || "1day";

    // Determine output size based on interval
    // Daily: 120 days (4 months) - expanded 4× for better FVG detection
    // 4H: 168 candles (4 weeks * 42 candles per week) - expanded 4×
    const outputsize = interval === "4h" ? 168 : 120;

    // Get API key from environment variable
    const apiKey = process.env.TWELVE_API_KEY || "demo_api_key";
    const isProduction = process.env.NODE_ENV === "production";
    const isDemoKey = !apiKey || apiKey.includes("demo") || apiKey.includes("test");

    // Fetch data (with server-side caching)
    const data = await fetchForexData(symbol, interval, apiKey, outputsize);

    const response = NextResponse.json({
      success: true,
      symbol,
      interval,
      data,
      usingMockData: !isProduction && isDemoKey,
    });

    // Add cache headers for browser caching (5 minutes)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Failed to fetch forex data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch forex data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
