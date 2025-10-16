import { NextRequest, NextResponse } from "next/server";
import { fetchForexData } from "@/services/twelveData";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol") || "EUR/USD";
    const interval = searchParams.get("interval") || "1day";

    // Determine output size based on interval
    // Daily: 30 days (1 month)
    // 4H: 42 candles (7 days * 6 candles per day)
    const outputsize = interval === "4h" ? 42 : 30;

    // Get API key from environment variable
    const apiKey = process.env.TWELVE_API_KEY || "demo_api_key";

    const data = await fetchForexData(symbol, interval, apiKey, outputsize);

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      data,
      usingMockData: !apiKey || apiKey.includes("demo") || apiKey.includes("test"),
    });
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
