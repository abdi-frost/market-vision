/**
 * Shared types for market analysis across the application
 */

// Bias/Direction types
export type BiasDirection = "bullish" | "bearish" | "neutral";
export type TradeSide = "buy" | "sell";
export type LiquidityType = "IRL" | "ERL";

// Market Bias
export interface MarketBias {
  bias: BiasDirection;
  confidence: number;
  reason: string;
}

// Fair Value Gap
export interface FairValueGap {
  start: number;
  end: number;
  direction: "bullish" | "bearish";
  timestamp: string;
  isFilled: boolean;
  fillTimestamp?: string;
}

// Swing Point
export interface SwingPoint {
  price: number;
  timestamp: string;
  type: "high" | "low";
}

// Liquidity Level
export interface LiquidityLevel {
  price: number;
  type: LiquidityType;
  side: TradeSide;
}

// Complete Market Structure Analysis
export interface MarketStructureAnalysis {
  fvgs: FairValueGap[];
  swingHigh: SwingPoint | null;
  swingLow: SwingPoint | null;
  irlLevels: LiquidityLevel[];
  erlLevels: LiquidityLevel[];
  bias: MarketBias;
}

// Analysis Metadata
export interface AnalysisMetadata {
  candleCount: number;
  lastCandleTime: string;
}

// Complete Analysis Document (from API/Database)
export interface MarketAnalysisDocument {
  _id?: string;
  symbol: string;
  timeframe: string;
  analysis: MarketStructureAnalysis;
  metadata?: AnalysisMetadata;
  timestamp: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Analysis Data with Latest Info (from API response)
export interface AnalysisData {
  symbol: string;
  timeframe: string;
  latestAnalysis: MarketAnalysisDocument;
  allTimeframes?: MarketAnalysisDocument[];
  lastUpdated: string;
}

// API Response for Latest Analyses
export interface LatestAnalysisResponse {
  pairs: AnalysisData[];
  count: number;
  timeframeFilter: string;
}

// Candle Data
export interface Candle {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Timeframe type
export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1day" | "1week";

// Badge Variants
export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

// Helper type for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
