export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TimeframeData {
  timeframe: string;
  data: CandlestickData[];
}

export interface PatternAnalysis {
  pattern: string;
  score: number;
  description: string;
}

export interface PredictionResult {
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string[];
  patterns: PatternAnalysis[];
  timeframeAnalysis: {
    [key: string]: {
      trend: 'bullish' | 'bearish' | 'neutral';
      strength: number;
    };
  };
}

export interface MarketData {
  symbol: string;
  data: {
    daily: CandlestickData[];
    fourHour: CandlestickData[];
  };
  lastUpdated: string;
}
