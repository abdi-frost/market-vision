# Cron Update Blueprint (Postgres + Drizzle)

## Goal

Minimize TwelveData API usage by:

- Calling TwelveData **once per hour** (or per timeframe cadence) to fetch **only the newest candles**.
- Keeping a **rolling local copy of ~1 month** of candles per pair/timeframe in Postgres.
- Running analysis/prediction **from the database**, not from freshly-fetched API payloads.

This gives you an “hour-late mirror” of the market, which is good enough for most analysis workflows.

---

## What Exists Today (Current Behavior)

### Entry point

- POST endpoint: [src/app/api/cron/update/route.ts](src/app/api/cron/update/route.ts)
- Core orchestration: [src/services/cronService.ts](src/services/cronService.ts)
- Data source: [src/services/twelveData.ts](src/services/twelveData.ts)
- Schedule/config: [src/config/cron.ts](src/config/cron.ts)

### Step-by-step: what POST `/api/cron/update` does

1. Reads `TWELVE_API_KEY` from env and aborts if missing.
2. Logs basic start info and the configured pair/timeframe counts.
3. Calls `processPairsBatch(...)`.
   - Builds all `{pair,timeframe}` combinations from config.
   - Processes them in batches (currently batch size is `1`) with a fixed delay between batches.
4. For each pair/timeframe, `processPairTimeframe(...)`:
   1) Fetches candles from TwelveData via `fetchForexData(symbol, timeframe, apiKey, outputsize)`.
      - TwelveData call is `time_series?...&interval=...&outputsize=...`
      - There is a **5-minute in-memory cache** in [src/services/twelveData.ts](src/services/twelveData.ts), but the cron is still doing a full API request per combination when cache misses.
   2) Stores candles into Postgres using `storeCandleData(...)`.
      - Uses an upsert on `(symbol,timeframe,datetime)` so duplicates don’t create duplicates.
   3) Runs `analyzeMarketStructure(candles)` using the candles array returned by TwelveData.
   4) Inserts a new analysis row into `market_analyses` (JSON payload + metadata).
5. After all pairs are processed, calls `cleanOldData(...)`.
   - Deletes candles beyond `maxCandlesPerPair` for each `(symbol,timeframe)`.
   - Deletes analyses older than `deleteOlderThanDays` and also caps by `maxAnalysesPerPair`.
6. Returns a summary: counts, total candles stored, analyses stored, duration.

### Current data model used by cron

- Candle storage: `candles` table
- Analysis snapshots: `market_analyses` table

Schema lives in [src/lib/db/schema.ts](src/lib/db/schema.ts).

---

## What Should Be Improved (Pain Points)

### 1) Too much repeated fetching

Right now each run fetches a *whole window* (example: 168 4h candles) even if only 1 new candle appeared.
That wastes API calls and makes it hard to scale to more pairs/timeframes.

### 2) Analysis runs on API payloads, not canonical DB state

The algorithm uses the array returned from TwelveData, not “the last N candles we truly have stored”.
This can create subtle drift (e.g., if TwelveData revises recent candles, or if the DB has slightly different coverage).

### 3) Missing auth enforcement

The route reads `CRON_SECRET` but does not validate an `Authorization` header.
That’s risky in production.

### 4) Cleanup policy is count-based, not time-based

The intent is “keep ~one month”, but the current cleanup uses `maxCandlesPerPair` and `deleteOlderThanDays`.
For a clean, predictable “1 month mirror,” time-based retention is simpler.

### 5) Inefficient query patterns at scale

`cleanOldData(...)` loops every `(symbol,timeframe)` combination and runs multiple queries.
That’s OK for small scale, but gets expensive quickly.

---

## Target State (What We Want)

### Desired behavior

- Cron runs hourly (or more often) and:
  1) Fetches only the newest candles from TwelveData.
  2) Upserts them.
  3) Reads a rolling window of candles from Postgres.
  4) Runs analysis/predictions from that window.
  5) Stores analysis output (either “latest only” or “hourly snapshots”).
  6) Deletes candles older than 30 days.

### Key principle

Treat Postgres as the source of truth.
TwelveData becomes an ingestion source, not your primary database.

---

## Plan: Efficient Hourly Incremental Ingestion

There are two practical options; pick A first, then add B later.

### Option A (recommended first): “Fetch recent N, upsert, dedupe”

Because [src/services/twelveData.ts](src/services/twelveData.ts) currently only supports `outputsize`, we can still achieve incremental behavior:

1. Query DB for the latest stored candle timestamp for `(symbol,timeframe)`.
2. Call TwelveData with a small `outputsize` that safely covers “what we might have missed” since last run.
   - Example: if cron runs hourly:
     - `1h` timeframe: request `outputsize=50`
     - `4h` timeframe: request `outputsize=30`
     - `1day` timeframe: request `outputsize=10`
3. Upsert into `candles` with the unique constraint.
4. Compute `newCount = insertedOrUpdatedCount - alreadyExistingCount` (optional) or simply treat upsert as idempotent.

Even without `start_date`, this approach greatly reduces calls and payload size.

### Option B (best long-term): fetch using a watermark (start/end time)

If TwelveData supports `start_date`/`end_date` (or an equivalent), add optional parameters:

- `fetchForexData(symbol, interval, apiKey, { start, end, outputsize })`

Then the cron can request only candles newer than the last stored timestamp.

---

## Plan: Run Analysis Without Re-calling TwelveData

### Core change

After ingestion, **do not** run analysis on the API response.
Instead:

1. Upsert recent candles.
2. Query the last N candles from Postgres for that `(symbol,timeframe)`.
3. Run `analyzeMarketStructure(lastNCandles)`.
4. Store analysis.

This ensures analysis can be re-run anytime (or on demand) using only your DB.

### How big should N be?

Pick N per timeframe based on what your algorithm needs.
A simple baseline:

- `1h`: last 720 candles (~30 days)
- `4h`: last 180 candles (~30 days)
- `1day`: last 60 candles (~2 months)

You can tune later.

---

## Plan: Keep “Last 1 Month” in Postgres

### Simplify retention to time-based cleanup

Instead of `maxCandlesPerPair`, keep this rule:

- Delete candles where `timestamp < now() - interval '30 days'`

You can still keep a max-count cap as a safety valve, but time-based is the main lever.

### Where to implement

- Update cleanup logic in [src/services/cronService.ts](src/services/cronService.ts) to delete by timestamp.
- Keep analyses either:
  - as hourly snapshots for 30 days, or
  - as “latest only” per pair/timeframe.

---

## Streamlining Opportunities (Concrete Improvements)

### 1) Enforce cron auth

In [src/app/api/cron/update/route.ts](src/app/api/cron/update/route.ts):

- Require `Authorization: Bearer <CRON_SECRET>`
- Return `401` if invalid.

### 2) Add ingestion state (optional but very helpful)

Add a small table (example name: `ingestion_state`) to track watermarks:

- `symbol`
- `timeframe`
- `last_candle_timestamp`
- `last_run_at`

This avoids extra “MAX(timestamp)” queries and makes debugging easier.

### 3) Make the cron idempotent

- Upsert candles (already done).
- If you keep hourly analysis snapshots, store them with a deterministic “bucket timestamp” (e.g., truncate to hour) and upsert.

### 4) Move from per-combination loops to set-based cleanup

Cleanup can be one or two SQL statements instead of loops.

### 5) Adjust scheduling per timeframe

Right now the cron runs one job for all timeframes.
You can reduce load by scheduling:

- hourly job: `1h`
- every 4 hours job: `4h`
- daily job: `1day`

Or keep a single hourly job but only fetch the small “recent N” for each timeframe.

---

## Suggested Implementation Phases

### Phase 1 (fast wins, minimal changes)

- Keep TwelveData calls, but reduce payloads:
  - request small `outputsize` for each timeframe.
- After upsert, query last N candles from Postgres and analyze those.
- Switch candle retention to “delete older than 30 days”.
- Enforce cron auth header.

### Phase 2 (reduce DB work and make it robust)

- Add `ingestion_state` table.
- Compute “how many candles to request” based on last watermark + timeframe.
- Improve logging: per-pair new candles, last timestamp, runtime.

### Phase 3 (best-in-class ingestion)

- Extend TwelveData wrapper to support `start_date`/`end_date` if available.
- Add a one-time backfill job that loads the first month of history.

---

## Practical Notes

### TwelveData caching vs DB

The cache in [src/services/twelveData.ts](src/services/twelveData.ts) is only a short-lived optimization.
Once you store in Postgres, the DB becomes the real cache.

### Neon considerations

- Use `DATABASE_URL` from Neon with `?sslmode=require`.
- Prefer fewer connections and more set-based queries.

---

## Acceptance Criteria (How we know it’s working)

- Cron runs hourly and does not fetch large historical windows.
- DB contains a rolling ~30 days of candles per `(symbol,timeframe)`.
- Analysis route(s) can serve results without calling TwelveData.
- Re-running cron is safe (idempotent) and mostly results in “0–few new candles stored” per run.
