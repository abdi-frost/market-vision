import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { marketAnalyses } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  successResponse,
  handleApiError,
  paginatedResponse,
  createApiError,
  errorResponse,
} from "@/lib/api";

/**
 * GET /api/analysis-history
 * Fetch historical market analyses with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const timeframe = searchParams.get("timeframe");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const conditions: any[] = [];
    if (symbol) conditions.push(eq(marketAnalyses.symbol, symbol.toUpperCase()));
    if (timeframe) conditions.push(eq(marketAnalyses.timeframe, timeframe));
    const where = conditions.length ? and(...conditions) : undefined;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const baseSelect = db.select().from(marketAnalyses);
    const baseCount = db.select({ count: sql<number>`count(*)` }).from(marketAnalyses);

    const [analyses, totalRows] = await Promise.all([
      (where ? baseSelect.where(where) : baseSelect)
        .orderBy(desc(marketAnalyses.timestamp))
        .limit(limit)
        .offset(skip),
      where ? baseCount.where(where) : baseCount,
    ]);

    const total = Number(totalRows[0]?.count ?? 0);

    return paginatedResponse(analyses, { page, limit, total });
  } catch (error) {
    console.error("Failed to fetch analysis history:", error);
    return handleApiError(error);
  }
}

/**
 * POST /api/analysis-history
 * Save a new market analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.symbol || !body.timeframe) {
      return errorResponse(
        createApiError(
          "Symbol and timeframe are required",
          "VALIDATION_ERROR",
          { required: ["symbol", "timeframe"] }
        )
      );
    }

    const inserted = await db
      .insert(marketAnalyses)
      .values({
        symbol: String(body.symbol).toUpperCase(),
        timeframe: String(body.timeframe),
        analysis: body.analysis ?? {},
        indicators: body.indicators ?? {},
        prediction: body.prediction ?? null,
        metadata: body.metadata ?? {},
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const analysis = inserted[0];

    return successResponse(
      { analysis },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Failed to save analysis:", error);
    return handleApiError(error);
  }
}

/**
 * DELETE /api/analysis-history?id=<analysisId>
 * Delete a market analysis by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        createApiError("Analysis ID is required", "VALIDATION_ERROR")
      );
    }

    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      return errorResponse(
        createApiError("Analysis ID must be a number", "VALIDATION_ERROR")
      );
    }

    const deleted = await db
      .delete(marketAnalyses)
      .where(eq(marketAnalyses.id, parsedId))
      .returning({ id: marketAnalyses.id });

    if (deleted.length === 0) {
      return errorResponse(createApiError("Analysis not found", "NOT_FOUND"));
    }

    return successResponse(
      { message: "Analysis deleted successfully" },
      {
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Failed to delete analysis:", error);
    return handleApiError(error);
  }
}
