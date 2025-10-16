import { NextRequest, NextResponse } from "next/server";
import { fetchOHLCData } from "@/services/marketData";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol") || "AAPL";

    const data = await fetchOHLCData();

    return NextResponse.json({
      success: true,
      symbol,
      data,
    });
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market data",
      },
      { status: 500 }
    );
  }
}
