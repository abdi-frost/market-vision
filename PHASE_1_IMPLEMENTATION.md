# Phase 1 Implementation Notes (Ingestion Only)

This document describes the Phase 1 code changes that make `/api/cron/update` **fetch and store candles only**.

Phase 1 requirements implemented:

- Use TwelveData `time_series` with **`outputsize`**.
- If it’s the **first run** for a `(symbol,timeframe)` (no candles stored yet), fetch **~1 month** worth of candles.
- Default TwelveData output to **New York timezone** using `timezone=America/New_York` (DST-aware UTC-4/UTC-5).
- Use **JSON** responses (`format=JSON`).
- Prefer chronological candles (`order=asc`).
- Loop pairs sequentially from `UPDATE_PAIRS`, and wait **10 seconds between pairs**.
- No analysis, no analysis storage, no automatic deletion/cleanup.

---

## What Changed

### TwelveData request defaults

File: [src/services/twelveData.ts](src/services/twelveData.ts)

- Builds request URLs using `URL` + `URLSearchParams`.
- Always sends:
  - `timezone=America/New_York`
  - `format=JSON`
  - `order=asc`
- Cache key now includes timezone/format/order to avoid mixing differently-ordered datasets.

### New ingestion-only cron flow

File: [src/services/cronService.ts](src/services/cronService.ts)

Added Phase 1 functions:

- `ingestPairTimeframe(symbol, timeframe, apiKey)`
  - Detects first run by checking whether any candle exists in DB for `(symbol,timeframe)`.
  - Chooses `outputsize`:
    - Bootstrap month:
      - `1h=720`, `4h=180`, `1day=30`
    - Normal runs:
      - `1h=120`, `4h=60`, `1day=40`
  - Fetches candles using TwelveData and upserts into Postgres.
  - Does **not** run analysis.

- `ingestPairsSequential(pairs, timeframes, apiKey, pairDelayMs=10000)`
  - Processes **pairs sequentially**.
  - For each pair, processes configured `timeframes`.
  - Sleeps 10 seconds between pairs.

Notes:

- Candle storage remains idempotent via the unique key on `(symbol,timeframe,datetime)`.
- The existing analysis functions remain in the codebase for later phases but are not called by `/api/cron/update`.

### Cron update endpoint behavior

File: [src/app/api/cron/update/route.ts](src/app/api/cron/update/route.ts)

- Now calls `ingestPairsSequential(...)`.
- No longer calls analysis or `cleanOldData(...)`.
- Response includes `totalAnalysesStored: 0` and cleanup counts as `0`.
- GET description updated to reflect Postgres ingestion.

---

## How To Operate Phase 1

### Control which pairs get ingested

File: [src/pairs.tsx](src/pairs.tsx)

Edit `UPDATE_PAIRS` (keep it 1–2 pairs for now).

### Trigger ingestion

- `POST /api/cron/update`

The endpoint will:

- For each pair in `UPDATE_PAIRS`:
  - ingest each timeframe in `CRON_CONFIG.timeframes`
  - wait 10 seconds

---

## Known Follow-Ups (Not In Phase 1)

- Add back analysis, but computed from DB windows instead of raw API payloads.
- Add optional cleanup endpoint (manual deletion for retention when desired).
- Add worker sharding / concurrency controls when `UPDATE_PAIRS` grows.
