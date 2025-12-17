# Type System Refactoring

## Summary

All types have been centralized in `src/types/analysis.ts` and can be imported from a single location for consistency and reusability across the application.

## Type Locations

### Primary Types (`src/types/analysis.ts`)

All analysis-related types are now defined here:

- `BiasDirection` - "bullish" | "bearish" | "neutral"
- `TradeSide` - "buy" | "sell"
- `LiquidityType` - "IRL" | "ERL"
- `MarketBias` - Market direction with confidence
- `FairValueGap` - FVG data structure
- `SwingPoint` - Support/Resistance points
- `LiquidityLevel` - Liquidity zone information
- `MarketStructureAnalysis` - Complete analysis result
- `AnalysisMetadata` - Analysis metadata
- `MarketAnalysisDocument` - Database/API document
- `AnalysisData` - API response data structure
- `Candle` - OHLC candle data
- `Timeframe` - Supported timeframes
- `BadgeVariant` - UI badge variants
- `ApiResponse<T>` - Unified API response wrapper

### Import Methods

**Option 1: Import from types directory (Recommended)**
```typescript
import type { MarketBias, FairValueGap, Candle } from "@/types/analysis";
// or
import type { MarketBias, FairValueGap, Candle } from "@/types";
```

**Option 2: Import from specific modules (Backward compatible)**
```typescript
import type { MarketBias } from "@/algorithms/fvgAnalysis";
import type { Candle } from "@/services/twelveData";
```

## Files Updated

### Type Definitions
- ✅ `src/types/analysis.ts` - New centralized type definitions
- ✅ `src/types/index.ts` - Central export point
- ✅ `src/types/market.ts` - Updated to use shared types

### Components & Pages
- ✅ `src/app/v2/page.tsx` - Using centralized types

### Services & Algorithms
- ✅ `src/algorithms/fvgAnalysis.ts` - Re-exports types for backward compatibility
- ✅ `src/services/twelveData.ts` - Using shared Candle type
- ✅ `src/services/cronService.ts` - Using shared types

### Configuration
- ✅ `src/config/cron.ts` - Using shared Timeframe type

### UI Components
- ✅ `src/components/ui/badge.tsx` - New component
- ✅ `src/components/ui/tabs.tsx` - New component
- ✅ `src/components/ui/progress.tsx` - New component

## Benefits

1. **Single Source of Truth** - All types defined in one place
2. **Consistency** - Same interfaces used everywhere
3. **Maintainability** - Update types in one location
4. **Type Safety** - Better TypeScript inference
5. **Discoverability** - Easy to find all available types
6. **Backward Compatibility** - Old imports still work

## Usage Examples

### In Components
```typescript
import type { AnalysisData, MarketBias, Timeframe } from "@/types";

const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
const [timeframe, setTimeframe] = useState<Timeframe>("1day");
```

### In Services
```typescript
import type { Candle, MarketStructureAnalysis } from "@/types";

export async function fetchData(): Promise<Candle[]> {
  // ...
}
```

### In API Routes
```typescript
import type { ApiResponse, LatestAnalysisResponse } from "@/types";

const response: ApiResponse<LatestAnalysisResponse> = {
  success: true,
  data: {
    pairs: [],
    count: 0,
    timeframeFilter: "all"
  }
};
```

## Migration Guide

To use the new centralized types in your code:

1. **Replace old imports:**
   ```typescript
   // Old
   import type { MarketBias } from "@/algorithms/fvgAnalysis";
   
   // New
   import type { MarketBias } from "@/types";
   ```

2. **Update type definitions:**
   ```typescript
   // Old - inline types
   interface MyData {
     bias: { bias: string; confidence: number; reason: string };
   }
   
   // New - shared types
   import type { MarketBias } from "@/types";
   interface MyData {
     bias: MarketBias;
   }
   ```

3. **Use API response wrapper:**
   ```typescript
   import type { ApiResponse, AnalysisData } from "@/types";
   
   const data: ApiResponse<AnalysisData[]> = await fetch("/api/...").then(r => r.json());
   ```

## Notes

- All old import paths still work for backward compatibility
- The `fvgAnalysis` module re-exports types to avoid breaking changes
- Type aliases are provided where needed (e.g., `RangeLevel = LiquidityLevel`)
