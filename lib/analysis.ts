import { CandlestickData, PatternAnalysis, PredictionResult } from './types';

// Technical indicators calculations
export function calculateSMA(data: CandlestickData[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(0);
      continue;
    }
    
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
    sma.push(sum / period);
  }
  
  return sma;
}

export function calculateEMA(data: CandlestickData[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first value
  const firstSum = data.slice(0, period).reduce((acc, candle) => acc + candle.close, 0);
  ema.push(firstSum / period);
  
  for (let i = 1; i < data.length; i++) {
    const value = (data[i].close - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(value);
  }
  
  return ema;
}

export function calculateRSI(data: CandlestickData[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      rsi.push(50); // Neutral value
      continue;
    }
    
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return [50, ...rsi]; // Add initial value
}

// Candlestick pattern detection
export function detectBullishEngulfing(data: CandlestickData[], index: number): boolean {
  if (index < 1) return false;
  
  const prev = data[index - 1];
  const curr = data[index];
  
  // Previous candle is bearish
  const prevBearish = prev.close < prev.open;
  // Current candle is bullish
  const currBullish = curr.close > curr.open;
  // Current candle engulfs previous
  const engulfs = curr.open <= prev.close && curr.close >= prev.open;
  
  return prevBearish && currBullish && engulfs;
}

export function detectBearishEngulfing(data: CandlestickData[], index: number): boolean {
  if (index < 1) return false;
  
  const prev = data[index - 1];
  const curr = data[index];
  
  // Previous candle is bullish
  const prevBullish = prev.close > prev.open;
  // Current candle is bearish
  const currBearish = curr.close < curr.open;
  // Current candle engulfs previous
  const engulfs = curr.open >= prev.close && curr.close <= prev.open;
  
  return prevBullish && currBearish && engulfs;
}

export function detectHammer(candle: CandlestickData): boolean {
  const body = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  
  // Hammer has small body, long lower shadow, and small/no upper shadow
  return lowerShadow > body * 2 && upperShadow < body * 0.5;
}

export function detectShootingStar(candle: CandlestickData): boolean {
  const body = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  
  // Shooting star has small body, long upper shadow, and small/no lower shadow
  return upperShadow > body * 2 && lowerShadow < body * 0.5;
}

export function detectDoji(candle: CandlestickData): boolean {
  const body = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low;
  
  // Doji has very small body relative to range
  return body < range * 0.1;
}

export function detectMorningStar(data: CandlestickData[], index: number): boolean {
  if (index < 2) return false;
  
  const first = data[index - 2];
  const second = data[index - 1];
  const third = data[index];
  
  // First candle is bearish
  const firstBearish = first.close < first.open;
  // Second candle has small body (gap down)
  const smallBody = Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.5;
  // Third candle is bullish and closes above midpoint of first candle
  const thirdBullish = third.close > third.open;
  const closesHigh = third.close > (first.open + first.close) / 2;
  
  return firstBearish && smallBody && thirdBullish && closesHigh;
}

export function detectEveningStar(data: CandlestickData[], index: number): boolean {
  if (index < 2) return false;
  
  const first = data[index - 2];
  const second = data[index - 1];
  const third = data[index];
  
  // First candle is bullish
  const firstBullish = first.close > first.open;
  // Second candle has small body (gap up)
  const smallBody = Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.5;
  // Third candle is bearish and closes below midpoint of first candle
  const thirdBearish = third.close < third.open;
  const closesLow = third.close < (first.open + first.close) / 2;
  
  return firstBullish && smallBody && thirdBearish && closesLow;
}

// Analyze patterns in data
export function analyzePatterns(data: CandlestickData[]): PatternAnalysis[] {
  if (data.length < 3) return [];
  
  const patterns: PatternAnalysis[] = [];
  const lastIndex = data.length - 1;
  const lastCandle = data[lastIndex];
  
  // Check for bullish patterns
  if (detectBullishEngulfing(data, lastIndex)) {
    patterns.push({
      pattern: 'Bullish Engulfing',
      score: 0.8,
      description: 'Strong bullish reversal pattern detected'
    });
  }
  
  if (detectHammer(lastCandle)) {
    patterns.push({
      pattern: 'Hammer',
      score: 0.7,
      description: 'Potential bullish reversal at support'
    });
  }
  
  if (detectMorningStar(data, lastIndex)) {
    patterns.push({
      pattern: 'Morning Star',
      score: 0.85,
      description: 'Strong bullish reversal pattern'
    });
  }
  
  // Check for bearish patterns
  if (detectBearishEngulfing(data, lastIndex)) {
    patterns.push({
      pattern: 'Bearish Engulfing',
      score: -0.8,
      description: 'Strong bearish reversal pattern detected'
    });
  }
  
  if (detectShootingStar(lastCandle)) {
    patterns.push({
      pattern: 'Shooting Star',
      score: -0.7,
      description: 'Potential bearish reversal at resistance'
    });
  }
  
  if (detectEveningStar(data, lastIndex)) {
    patterns.push({
      pattern: 'Evening Star',
      score: -0.85,
      description: 'Strong bearish reversal pattern'
    });
  }
  
  // Check for indecision
  if (detectDoji(lastCandle)) {
    patterns.push({
      pattern: 'Doji',
      score: 0,
      description: 'Market indecision, potential reversal'
    });
  }
  
  return patterns;
}

// Analyze trend for a timeframe
export function analyzeTrendStrength(data: CandlestickData[]): { trend: 'bullish' | 'bearish' | 'neutral'; strength: number } {
  if (data.length < 20) {
    return { trend: 'neutral', strength: 0 };
  }
  
  // Calculate moving averages
  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, Math.min(50, data.length));
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const lastIndex = data.length - 1;
  const currentPrice = data[lastIndex].close;
  const lastSMA20 = sma20[lastIndex];
  const lastSMA50 = sma50[lastIndex];
  
  // MACD
  const macd = ema12[lastIndex] - ema26[lastIndex];
  
  // RSI
  const rsi = calculateRSI(data);
  const currentRSI = rsi[rsi.length - 1];
  
  let score = 0;
  
  // Price vs moving averages
  if (currentPrice > lastSMA20) score += 1;
  if (currentPrice > lastSMA50) score += 1;
  if (lastSMA20 > lastSMA50) score += 1;
  
  // MACD
  if (macd > 0) score += 1;
  
  // RSI
  if (currentRSI > 50) score += 1;
  if (currentRSI > 60) score += 0.5;
  if (currentRSI > 70) score += 0.5;
  
  // Recent momentum
  const recentCandles = data.slice(-5);
  const bullishCandles = recentCandles.filter(c => c.close > c.open).length;
  score += (bullishCandles - 2.5) / 2.5; // -1 to +1
  
  // Normalize score to -1 to 1
  const normalizedScore = Math.max(-1, Math.min(1, score / 7));
  
  if (normalizedScore > 0.3) {
    return { trend: 'bullish', strength: normalizedScore };
  } else if (normalizedScore < -0.3) {
    return { trend: 'bearish', strength: Math.abs(normalizedScore) };
  } else {
    return { trend: 'neutral', strength: Math.abs(normalizedScore) };
  }
}

// Main prediction function
export function predictNextDay(
  dailyData: CandlestickData[],
  fourHourData: CandlestickData[]
): PredictionResult {
  if (dailyData.length < 20) {
    return {
      prediction: 'neutral',
      confidence: 0,
      reasoning: ['Insufficient data for analysis'],
      patterns: [],
      timeframeAnalysis: {}
    };
  }
  
  // Analyze patterns
  const dailyPatterns = analyzePatterns(dailyData);
  const fourHourPatterns = analyzePatterns(fourHourData);
  
  // Analyze trends
  const dailyTrend = analyzeTrendStrength(dailyData);
  const fourHourTrend = analyzeTrendStrength(fourHourData);
  
  // Calculate pattern score
  const patternScore = [...dailyPatterns, ...fourHourPatterns]
    .reduce((sum, p) => sum + p.score, 0);
  
  // Calculate trend score
  const trendScore = 
    (dailyTrend.trend === 'bullish' ? dailyTrend.strength : -dailyTrend.strength) * 2 +
    (fourHourTrend.trend === 'bullish' ? fourHourTrend.strength : -fourHourTrend.strength);
  
  // Combined score
  const totalScore = patternScore + trendScore;
  
  // Determine prediction
  let prediction: 'bullish' | 'bearish' | 'neutral';
  let confidence: number;
  
  if (totalScore > 1) {
    prediction = 'bullish';
    confidence = Math.min(95, 50 + totalScore * 15);
  } else if (totalScore < -1) {
    prediction = 'bearish';
    confidence = Math.min(95, 50 + Math.abs(totalScore) * 15);
  } else {
    prediction = 'neutral';
    confidence = 50 - Math.abs(totalScore) * 20;
  }
  
  // Build reasoning
  const reasoning: string[] = [];
  
  if (dailyTrend.trend !== 'neutral') {
    reasoning.push(`Daily timeframe shows ${dailyTrend.trend} trend with ${(dailyTrend.strength * 100).toFixed(0)}% strength`);
  }
  
  if (fourHourTrend.trend !== 'neutral') {
    reasoning.push(`4-hour timeframe shows ${fourHourTrend.trend} trend with ${(fourHourTrend.strength * 100).toFixed(0)}% strength`);
  }
  
  if (dailyPatterns.length > 0) {
    reasoning.push(`Detected patterns on daily: ${dailyPatterns.map(p => p.pattern).join(', ')}`);
  }
  
  if (fourHourPatterns.length > 0) {
    reasoning.push(`Detected patterns on 4-hour: ${fourHourPatterns.map(p => p.pattern).join(', ')}`);
  }
  
  // Calculate RSI for additional context
  const rsi = calculateRSI(dailyData);
  const currentRSI = rsi[rsi.length - 1];
  
  if (currentRSI > 70) {
    reasoning.push(`RSI indicates overbought conditions (${currentRSI.toFixed(1)})`);
  } else if (currentRSI < 30) {
    reasoning.push(`RSI indicates oversold conditions (${currentRSI.toFixed(1)})`);
  }
  
  if (reasoning.length === 0) {
    reasoning.push('No strong signals detected, market appears neutral');
  }
  
  return {
    prediction,
    confidence,
    reasoning,
    patterns: [...dailyPatterns, ...fourHourPatterns],
    timeframeAnalysis: {
      daily: dailyTrend,
      '4h': fourHourTrend
    }
  };
}
