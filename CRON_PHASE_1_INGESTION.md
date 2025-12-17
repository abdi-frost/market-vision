# Phase 1 — TwelveData Ingestion (Outputsize Bootstrap)

## Phase Goal

Phase 1 is about **calling TwelveData efficiently** and **storing candles correctly** so we can:

- Add more symbols to the pair list without breaking the system.
- Keep historical data (no forced “delete >30 days” behavior in this phase).
- Ensure first-run bootstrap fetches ~1 month of data.
- Default all TwelveData responses to New York time (UTC-4/UTC-5 via `America/New_York`).

Non-goals for Phase 1:

- Rewriting analysis algorithms.
- Redesigning the UI.
- Aggressive retention cleanup.

---

## Current Starting Point (What We Have)

- Cron endpoint orchestrator: [src/app/api/cron/update/route.ts](src/app/api/cron/update/route.ts)
- Ingestion + storage + analysis orchestration: [src/services/cronService.ts](src/services/cronService.ts)
- TwelveData fetch wrapper: [src/services/twelveData.ts](src/services/twelveData.ts)
- Postgres schema: [src/lib/db/schema.ts](src/lib/db/schema.ts)

We already have a strong base because candle storage is **idempotent** via unique key + upsert on `(symbol, timeframe, datetime)`.

---

## TwelveData Official Docs (Relevant Parts)

Source: https://twelvedata.com/docs#time-series

### Endpoint

- `GET https://api.twelvedata.com/time_series`

### Core Parameters We Care About

- `symbol` (required): e.g. `EUR/USD`, `GBP/USD`.
- `interval` (required): supported values include `1h`, `4h`, `1day` (and many more: `1min`, `5min`, `15min`, `30min`, `45min`, `2h`, `5h`, `1week`, `1month`).
- `outputsize` (optional): number of datapoints. Range `1..5000`.
  - Default is `30` when **no date parameters** are set.
  - If you provide `start_date`/`end_date`, the docs state default outputsize becomes the **maximum**.
- `start_date` / `end_date` (optional):
  - Format `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`.
  - Default time interpretation:
    - Forex + crypto: `UTC`
    - Stocks: exchange local time
  - If `timezone` is provided, the API interprets `start_date`/`end_date` in that timezone.
- `timezone` (optional):
  - `Exchange` (default)
  - `UTC`
  - Or an IANA timezone name like `America/New_York` (case-sensitive).
- `order` (optional): `asc` or `desc` (default `desc`).
- `format` (optional): `JSON` (default) or `CSV`.

### Response Shape (JSON)

- `meta`: contains symbol, interval, exchange timezone, etc.
- `values`: array of candles with `datetime`, `open`, `high`, `low`, `close`, and sometimes `volume`.

### Implication For Our System

- We can do true incremental fetching using `start_date` (best), or we can do “recent N” via `outputsize` (good enough early).
- The default ordering is `desc`, so we should explicitly set `order=asc` if we want easy chronological handling.

---

## Phase 1 Design Decisions

### 1) Keep old data (no forced retention)

In Phase 1 we do **not** delete candles older than 30 days.

- Reason: you said you may want to revisit older history sometimes.
- We can add a **separate optional endpoint** later (Phase 2+) to run cleanup manually (or a separate scheduled job).

Recommended: keep the existing “cap by count” guardrails only if storage cost becomes a problem. Otherwise, disable or relax cleanup.

### 2) Ingestion must remain idempotent

We already have the right invariant:

- A candle is uniquely identified by `(symbol, timeframe, datetime)`.
- We can safely re-run ingestion without creating duplicates.

**Rule:** treat TwelveData as “input stream”, Postgres as “source of truth”.

### 3) Worker/workload optimization is NOT handled in Phase 1

Phase 1 keeps it simple:

- Loop over each pair in `UPDATE_PAIRS`.
- After finishing a pair, wait **10 seconds**.
- Continue to the next pair.

---

## TwelveData Call Policy (Phase 1)

Phase 1 uses **`outputsize`** while fetching from TwelveData.

### Request defaults (required)

- `format=JSON`
- `timezone=America/New_York`
  - This gives the desired “UTC-4/UTC-5 for New York” behavior automatically (DST-aware).
  - TwelveData accepts IANA timezone names like `America/New_York`.
- `order=asc` (recommended)
  - TwelveData defaults to `desc`. `asc` means candles arrive already chronological.

### First run behavior (bootstrap)

If there are **zero candles** stored yet for `(symbol, timeframe)`, fetch approximately **one month** of candles by setting `outputsize` based on the interval:

- `1h`: `720` (30 days × 24)
- `4h`: `180` (30 days × 6)
- `1day`: `30`

This is inside TwelveData’s documented `outputsize` range (`1..5000`).

### Subsequent runs (normal operation)

After we have at least some candles for `(symbol, timeframe)`:

- Keep using `outputsize`, but reduce it to a smaller window.
- Example starting points:
  - `1h`: `120`
  - `4h`: `60`
  - `1day`: `40`

Because we upsert on `(symbol, timeframe, datetime)`, overlap is safe.

### “Better formatting approach” for building requests

Use `URL` + `URLSearchParams` (or equivalent) to build the request cleanly and avoid string concatenation bugs.

Include at least these params:

- `symbol`
- `interval`
- `outputsize`
- `timezone=America/New_York`
- `format=JSON`
- `order=asc`
- `apikey`

---

## Storage Requirements (Phase 1)

### Candle table requirements

From [src/lib/db/schema.ts](src/lib/db/schema.ts):

- Unique constraint on `(symbol, timeframe, datetime)`.
- Store:
  - `symbol`
  - `timeframe`
  - `datetime` (string)
  - `timestamp` (numeric) for fast comparisons
  - `open`, `high`, `low`, `close` (numeric)

### Recommended schema refinements (Phase 1 candidates)

These are optional but directly help ingestion stability:

- Enforce that `timestamp` is always derived from `datetime` consistently.
- Ensure timezone normalization is consistent (prefer storing timestamps in UTC).
- Add a lightweight `ingestion_runs` table (or log table) later for observability (not required).

---

## Refactoring Targets (API + Service Layer)

Phase 1 focuses on ingestion. API design refactors can come later.

### A) Make pair list explicit

Define pair list in one place:

- `UPDATE_PAIRS` source-of-truth (file or config).

Then make cron service accept `pairs: string[]` as an argument so the loop stays simple and testable.

---

## Acceptance Criteria (Phase 1)

- First run fetches ~30 days worth of candles using `outputsize`.
- Normal runs use smaller `outputsize` windows.
- Requests default to `timezone=America/New_York` and `format=JSON`.
- Pairs are processed sequentially with a 10-second pause between pairs.
- No automatic deletion of older data.

---

## Next Step After This Doc

If you want, I can implement Phase 1 as code changes:

- Update [src/services/twelveData.ts](src/services/twelveData.ts) to default `timezone=America/New_York`, `format=JSON`, and `order=asc`.
- Add first-run bootstrap `outputsize` values (month-worth) vs normal-run smaller `outputsize` values.
- Add a 10-second delay between pairs in the cron loop.
- Relax/disable cleanup in the cron path so old data is preserved.

---

## Implemented

Phase 1 is now implemented in code. See:

- [PHASE_1_IMPLEMENTATION.md](PHASE_1_IMPLEMENTATION.md)
