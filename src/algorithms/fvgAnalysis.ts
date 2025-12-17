/**
 * Fair Value Gap (FVG) and Market Structure Analysis
 * Based on ICT Smart Money Concepts
 */

import { BIAS_CONFIG } from "@/config";
import type {
  Candle,
  FairValueGap,
  SwingPoint,
  LiquidityLevel,
  MarketBias,
  MarketStructureAnalysis,
} from "@/types/analysis";

// Legacy type alias for backward compatibility
export type RangeLevel = LiquidityLevel;

// Re-export types for backward compatibility
export type { 
  Candle,
  FairValueGap, 
  SwingPoint, 
  MarketBias,
};

// Legacy interface for backward compatibility
export interface MarketStructure extends MarketStructureAnalysis {}

/**
 * Detect Fair Value Gaps in candlestick data
 * Bullish FVG: candle[n-2].high < candle[n].low
 * Bearish FVG: candle[n-2].low > candle[n].high
 */
export function detectFVGs(candles: Candle[]): FairValueGap[] {
  const fvgs: FairValueGap[] = [];

  if (candles.length < 3) {
    return fvgs;
  }

  for (let i = 2; i < candles.length; i++) {
    const prev2 = candles[i - 2];
    const prev1 = candles[i - 1];
    const current = candles[i];

    // Bullish FVG: gap up (previous candle's high < current candle's low)
    if (prev2.high < current.low) {
      const fvg: FairValueGap = {
        start: prev2.high,
        end: current.low,
        direction: "bullish",
        timestamp: prev1.datetime,
        isFilled: false,
      };

      // Check if this FVG has been filled by subsequent candles
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].close >= fvg.start && candles[j].close <= fvg.end) {
          fvg.isFilled = true;
          fvg.fillTimestamp = candles[j].datetime;
          break;
        }
      }

      fvgs.push(fvg);
    }

    // Bearish FVG: gap down (previous candle's low > current candle's high)
    if (prev2.low > current.high) {
      const fvg: FairValueGap = {
        start: current.high,
        end: prev2.low,
        direction: "bearish",
        timestamp: prev1.datetime,
        isFilled: false,
      };

      // Check if this FVG has been filled by subsequent candles
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].close >= fvg.start && candles[j].close <= fvg.end) {
          fvg.isFilled = true;
          fvg.fillTimestamp = candles[j].datetime;
          break;
        }
      }

      fvgs.push(fvg);
    }
  }

  return fvgs;
}

/**
 * Detect swing highs and swing lows
 * A swing high is a candle with a higher high than the surrounding candles
 * A swing low is a candle with a lower low than the surrounding candles
 */
export function detectSwingPoints(
  candles: Candle[],
  lookback: number = 5
): { swingHigh: SwingPoint | null; swingLow: SwingPoint | null } {
  if (candles.length < lookback * 2 + 1) {
    return { swingHigh: null, swingLow: null };
  }

  let swingHigh: SwingPoint | null = null;
  let swingLow: SwingPoint | null = null;

  // Start from recent data and look for swing points
  for (let i = candles.length - lookback - 1; i >= lookback; i--) {
    const current = candles[i];
    let isSwingHigh = true;
    let isSwingLow = true;

    // Check if current candle is a swing high/low
    for (let j = 1; j <= lookback; j++) {
      const left = candles[i - j];
      const right = candles[i + j];

      if (left.high >= current.high || right.high >= current.high) {
        isSwingHigh = false;
      }
      if (left.low <= current.low || right.low <= current.low) {
        isSwingLow = false;
      }
    }

    // Record the most recent swing high
    if (isSwingHigh && !swingHigh) {
      swingHigh = {
        price: current.high,
        timestamp: current.datetime,
        type: "high",
      };
    }

    // Record the most recent swing low
    if (isSwingLow && !swingLow) {
      swingLow = {
        price: current.low,
        timestamp: current.datetime,
        type: "low",
      };
    }

    // Exit early if we found both
    if (swingHigh && swingLow) {
      break;
    }
  }

  return { swingHigh, swingLow };
}

/**
 * Identify Internal Range Liquidity (IRL) and External Range Liquidity (ERL)
 */
export function identifyLiquidityLevels(
  candles: Candle[],
  swingHigh: SwingPoint | null,
  swingLow: SwingPoint | null,
  fvgs: FairValueGap[]
): { irlLevels: RangeLevel[]; erlLevels: RangeLevel[] } {
  const irlLevels: RangeLevel[] = [];
  const erlLevels: RangeLevel[] = [];

  if (!swingHigh || !swingLow) {
    return { irlLevels, erlLevels };
  }

  // Internal Range Liquidity: FVGs and key levels within swing range
  for (const fvg of fvgs) {
    if (!fvg.isFilled) {
      const fvgMid = (fvg.start + fvg.end) / 2;
      if (fvgMid >= swingLow.price && fvgMid <= swingHigh.price) {
        irlLevels.push({
          price: fvgMid,
          type: "IRL",
          side: fvg.direction === "bullish" ? "buy" : "sell",
        });
      }
    }
  }

  // External Range Liquidity: Levels beyond swing high/low
  // Buy-side liquidity above swing high
  erlLevels.push({
    price: swingHigh.price * 1.001, // Slightly above swing high
    type: "ERL",
    side: "buy",
  });

  // Sell-side liquidity below swing low
  erlLevels.push({
    price: swingLow.price * 0.999, // Slightly below swing low
    type: "ERL",
    side: "sell",
  });

  return { irlLevels, erlLevels };
}

/**
 * Determine market bias based on price action around FVGs and liquidity levels
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function determineMarketBias(
  candles: Candle[],
  fvgs: FairValueGap[],
  swingHigh: SwingPoint | null,
  swingLow: SwingPoint | null,
  _irlLevels: RangeLevel[],
  _erlLevels: RangeLevel[]
): MarketBias {
  if (candles.length === 0) {
    return { bias: "neutral", confidence: 0, reason: "Insufficient data" };
  }

  const latestCandle = candles[candles.length - 1];
  const recentCandles = candles.slice(BIAS_CONFIG.recentCandleCount); // Last 10 candles

  // Count bullish vs bearish candles in recent data
  let bullishCount = 0;
  let bearishCount = 0;

  for (const candle of recentCandles) {
    if (candle.close > candle.open) {
      bullishCount++;
    } else {
      bearishCount++;
    }
  }

  // Check for active unfilled FVGs
  const activeBullishFVGs = fvgs.filter(
    (fvg) => fvg.direction === "bullish" && !fvg.isFilled
  );
  const activeBearishFVGs = fvgs.filter(
    (fvg) => fvg.direction === "bearish" && !fvg.isFilled
  );

  // Determine if price is moving toward external liquidity
  let targetingExternalBuyLiquidity = false;
  let targetingExternalSellLiquidity = false;

  if (swingHigh && swingLow) {
    const priceRange = swingHigh.price - swingLow.price;
    const currentPosition = (latestCandle.close - swingLow.price) / priceRange;

    // If price is in upper 30% and moving up, likely targeting buy-side ERL
    if (currentPosition > BIAS_CONFIG.liquidityUpperThreshold && bullishCount > bearishCount) {
      targetingExternalBuyLiquidity = true;
    }

    // If price is in lower 30% and moving down, likely targeting sell-side ERL
    if (currentPosition < BIAS_CONFIG.liquidityLowerThreshold && bearishCount > bullishCount) {
      targetingExternalSellLiquidity = true;
    }
  }

  // Check if price reacted to FVG
  let reactedToBullishFVG = false;
  let reactedToBearishFVG = false;

  for (const fvg of activeBullishFVGs) {
    // Check if recent price touched the FVG and reversed up
    const touchedFVG = recentCandles.some(
      (c) => c.low <= fvg.end && c.low >= fvg.start
    );
    const reversedUp = recentCandles.slice(-BIAS_CONFIG.reversalCheckCount).every((c) => c.close > c.open);
    if (touchedFVG && reversedUp) {
      reactedToBullishFVG = true;
    }
  }

  for (const fvg of activeBearishFVGs) {
    // Check if recent price touched the FVG and reversed down
    const touchedFVG = recentCandles.some(
      (c) => c.high >= fvg.start && c.high <= fvg.end
    );
    const reversedDown = recentCandles.slice(-3).every((c) => c.close < c.open);
    if (touchedFVG && reversedDown) {
      reactedToBearishFVG = true;
    }
  }

  // Determine bias and confidence
  let bias: "bullish" | "bearish" | "neutral" = "neutral";
  let confidence = BIAS_CONFIG.baseConfidence;
  let reason = "No clear directional bias";

  // Bullish scenarios
  if (reactedToBullishFVG || (targetingExternalBuyLiquidity && bullishCount > bearishCount)) {
    bias = "bullish";
    confidence = BIAS_CONFIG.reactionConfidence;
    reason = reactedToBullishFVG
      ? "Price reacted from bullish FVG, seeking higher levels"
      : "Price targeting external buy-side liquidity";

    if (activeBullishFVGs.length > activeBearishFVGs.length) {
      confidence += BIAS_CONFIG.extraFVGConfidence;
    }
  }
  // Bearish scenarios
  else if (reactedToBearishFVG || (targetingExternalSellLiquidity && bearishCount > bullishCount)) {
    bias = "bearish";
    confidence = 70;
    reason = reactedToBearishFVG
      ? "Price reacted from bearish FVG, seeking lower levels"
      : "Price targeting external sell-side liquidity";

    if (activeBearishFVGs.length > activeBullishFVGs.length) {
      confidence += 10;
    }
  }
  // General trend-based bias
  else if (bullishCount > bearishCount * BIAS_CONFIG.momentumMultiplier) {
    bias = "bullish";
    confidence = 60;
    reason = "Recent price action shows bullish momentum";
  } else if (bearishCount > bullishCount * BIAS_CONFIG.momentumMultiplier) {
    bias = "bearish";
    confidence = 60;
    reason = "Recent price action shows bearish momentum";
  }

  return { bias, confidence: Math.min(confidence, BIAS_CONFIG.maxConfidence), reason };
}

/**
 * Main function to analyze market structure
 */
export function analyzeMarketStructure(candles: Candle[]): MarketStructure {
  // Detect FVGs
  const fvgs = detectFVGs(candles);

  // Detect swing points
  const { swingHigh, swingLow } = detectSwingPoints(candles);

  // Identify liquidity levels
  const { irlLevels, erlLevels } = identifyLiquidityLevels(
    candles,
    swingHigh,
    swingLow,
    fvgs
  );

  // Determine market bias
  const bias = determineMarketBias(
    candles,
    fvgs,
    swingHigh,
    swingLow,
    irlLevels,
    erlLevels
  );

  return {
    fvgs,
    swingHigh,
    swingLow,
    irlLevels,
    erlLevels,
    bias,
  };
}
