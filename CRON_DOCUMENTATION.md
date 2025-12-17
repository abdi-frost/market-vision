# Cron Job Documentation

## Overview

The cron job system automatically fetches market data from TwelveData API, stores it in Postgres (via Drizzle), performs technical analysis, and saves the results for quick retrieval by the frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cron Job Flow                             │
└─────────────────────────────────────────────────────────────┘

1. Trigger: POST /api/cron/update
   │
   ├─► For each pair in config:
   │   │
   │   ├─► Fetch OHLC data from TwelveData API
   │   │   (Multiple timeframes: 1day, 4h)
   │   │
  │   ├─► Store candles in Postgres (candles table)
   │   │   • Upsert to avoid duplicates
   │   │   • Indexed by symbol, timeframe, datetime
   │   │
   │   ├─► Run FVG analysis algorithm
   │   │   • Detect Fair Value Gaps
   │   │   • Identify swing highs/lows
   │   │   • Calculate IRL/ERL levels
   │   │   • Determine market bias
   │   │
   │   └─► Store analysis results (MarketAnalysis collection)
   │       • Latest analysis for each pair/timeframe
   │
   └─► Clean old data based on retention policy
       • Keep max 500 candles per pair/timeframe
       • Keep max 100 analyses per pair/timeframe
       • Delete data older than 180 days

2. Frontend retrieves data:
   • GET /api/analysis/latest - Latest analysis results
   • GET /api/candles - Historical candle data
```

## API Endpoints

### 1. Cron Update Endpoint

**POST** `/api/cron/update`

Fetches, stores, and analyzes data for all configured pairs.

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "processed": 22,
      "successful": 22,
      "failed": 0,
      "totalCandlesStored": 2640,
      "totalAnalysesStored": 22,
      "durationMs": 45230
    },
    "cleanup": {
      "candlesDeleted": 150,
      "analysesDeleted": 20
    },
    "results": [
      {
        "symbol": "EUR/USD",
        "timeframe": "1day",
        "success": true,
        "candlesStored": 120,
        "analysisStored": true
      }
      // ... more results
    ]
  },
  "metadata": {
    "timestamp": "2025-12-12T10:30:00.000Z"
  }
}
```

**GET** `/api/cron/update`

Get configuration and status information.

### 2. Latest Analysis Endpoint

**GET** `/api/analysis/latest`

Get the latest analysis for one or all pairs.

**Query Parameters:**
- `symbol` (optional): Specific pair like "EURUSD" or "EUR/USD"
- `timeframe` (optional): Specific timeframe like "1day" or "4h"
- `limit` (optional): Number of analyses per pair (default: 1)

**Examples:**

Get all latest analyses:
```
GET /api/analysis/latest
```

Get specific pair:
```
GET /api/analysis/latest?symbol=EUR/USD&timeframe=1day
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pairs": [
      {
        "symbol": "EURUSD",
        "timeframe": "1day",
        "latestAnalysis": {
          "_id": "...",
          "symbol": "EURUSD",
          "timeframe": "1day",
          "analysis": {
            "fvgs": [...],
            "swingHigh": {...},
            "swingLow": {...},
            "irlLevels": [...],
            "erlLevels": [...],
            "bias": {
              "bias": "bullish",
              "confidence": 75,
              "reason": "Multiple bullish FVGs detected"
            }
          },
          "metadata": {
            "candleCount": 120,
            "lastCandleTime": "2025-12-12"
          },
          "timestamp": "2025-12-12T10:30:00.000Z"
        },
        "lastUpdated": "2025-12-12T10:30:00.000Z"
      }
    ],
    "count": 11,
    "timeframeFilter": "all"
  }
}
```

### 3. Candles Endpoint

**GET** `/api/candles`

Get historical candle data.

**Query Parameters:**
- `symbol` (required): Pair symbol
- `timeframe` (required): Timeframe
- `limit` (optional): Number of candles (default: 100, max: 500)
- `from` (optional): Start date (ISO format)
- `to` (optional): End date (ISO format)

**Example:**
```
GET /api/candles?symbol=EUR/USD&timeframe=1day&limit=200
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "EUR/USD",
    "timeframe": "1day",
    "candles": [
      {
        "datetime": "2025-08-01",
        "open": 1.0850,
        "high": 1.0875,
        "low": 1.0840,
        "close": 1.0860
      }
      // ... more candles
    ],
    "count": 120,
    "range": {
      "from": "2025-08-01",
      "to": "2025-12-12"
    }
  }
}
```

## Configuration

Configuration is in `src/config/cron.ts`:

```typescript
export const CRON_CONFIG = {
  // Pairs to monitor
  pairs: MAJOR_FOREX_PAIRS, // 11 pairs
  
  // Timeframes to analyze
  timeframes: ["1day", "4h"],
  
  // Candles to fetch per timeframe
  candleCounts: {
    "1day": 120,  // 4 months
    "4h": 168,    // 4 weeks
  },
  
  // Data retention
  retention: {
    maxCandlesPerPair: 500,
    maxAnalysesPerPair: 100,
    deleteOlderThanDays: 180,
  },
};
```

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dev-mv
TWELVE_API_KEY=your_api_key
CRON_SECRET=your_secure_random_string
```

### 2. Test the Cron Job Manually

```bash
curl -X POST http://localhost:3000/api/cron/update \
  -H "Authorization: Bearer your_cron_secret"
```

### 3. Set Up Automated Cron

#### Option A: Vercel Cron Jobs (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

This runs every 4 hours.

#### Option B: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Example GitHub Action (`.github/workflows/cron.yml`):

```yaml
name: Market Data Update
on:
  schedule:
    - cron: '0 */4 * * *' # Every 4 hours
  workflow_dispatch: # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron Endpoint
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/update \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Data Models

### Candle Model

Stores OHLC data from TwelveData API.

```typescript
{
  symbol: "EURUSD",
  timeframe: "1day",
  datetime: "2025-12-12",
  timestamp: Date,
  open: 1.0850,
  high: 1.0875,
  low: 1.0840,
  close: 1.0860,
  volume?: number
}
```

### MarketAnalysis Model

Stores analysis results from FVG algorithm.

```typescript
{
  symbol: "EURUSD",
  timeframe: "1day",
  analysis: {
    fvgs: [...],      // Fair Value Gaps
    swingHigh: {...}, // Last swing high
    swingLow: {...},  // Last swing low
    irlLevels: [...], // Internal Range Liquidity
    erlLevels: [...], // External Range Liquidity
    bias: {
      bias: "bullish" | "bearish" | "neutral",
      confidence: 75,
      reason: "..."
    }
  },
  metadata: {
    candleCount: 120,
    lastCandleTime: "2025-12-12"
  },
  timestamp: Date
}
```

## Rate Limiting

The cron job processes pairs in batches to avoid API rate limits:

- **Batch size**: 3 concurrent requests
- **Delay between batches**: 1.5 seconds
- **Total pairs**: 11 pairs × 2 timeframes = 22 requests
- **Estimated duration**: ~45-60 seconds

TwelveData free tier allows:
- 8 API calls per minute
- 800 API calls per day

With current config (22 requests every 4 hours):
- 132 requests per day (well within limit)

## Monitoring

Check cron job status:

```bash
# Get configuration
curl http://localhost:3000/api/cron/update

# Check latest analyses
curl http://localhost:3000/api/analysis/latest
```

## Troubleshooting

### No data returned

1. Check if cron job has run: `GET /api/analysis/latest`
2. Check database connection in logs
3. Verify TWELVE_API_KEY is valid
4. Check API rate limits

### Analysis not updating

1. Verify cron job is running (check logs)
2. Check retention policy isn't deleting too much
3. Verify analysis algorithm is working

### High API usage

1. Reduce pairs in `CRON_CONFIG.pairs`
2. Reduce timeframes
3. Increase cron schedule interval

## Performance Tips

1. **Index optimization**: Models have indexes on frequently queried fields
2. **Batch processing**: Processes multiple pairs concurrently
3. **Upserts**: Avoids duplicate data
4. **Cleanup**: Automatic old data removal
5. **Caching**: Consider adding Redis for frequently accessed data

## Security

1. **Protect the endpoint**: Always use `CRON_SECRET`
2. **Use HTTPS**: Never send secrets over HTTP
3. **Rate limiting**: Consider adding rate limiting middleware
4. **Monitoring**: Set up alerts for failed cron jobs

## Next Steps

1. Set up monitoring/alerting for cron failures
2. Add Redis caching for latest analyses
3. Create admin dashboard to view cron job history
4. Add WebSocket support for real-time updates
5. Implement data backups
