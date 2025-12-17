import { NextRequest } from "next/server";
import { fetchOHLCData } from "@/services/marketData";
import { successResponse, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol") || "AAPL";

    const data = await fetchOHLCData();

    return successResponse(
      {
        symbol,
        data,
      },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    return handleApiError(error);
  }
}
