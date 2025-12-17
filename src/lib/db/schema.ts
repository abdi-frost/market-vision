import {
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  doublePrecision,
} from 'drizzle-orm/pg-core';

export const candles = pgTable(
  'candles',
  {
    id: serial('id').primaryKey(),
    symbol: text('symbol').notNull(),
    timeframe: text('timeframe').notNull(),
    datetime: text('datetime').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    open: doublePrecision('open').notNull(),
    high: doublePrecision('high').notNull(),
    low: doublePrecision('low').notNull(),
    close: doublePrecision('close').notNull(),
    volume: doublePrecision('volume'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('candles_symbol_timeframe_datetime_uidx').on(
      table.symbol,
      table.timeframe,
      table.datetime
    ),
    index('candles_symbol_timeframe_timestamp_idx').on(
      table.symbol,
      table.timeframe,
      table.timestamp
    ),
  ]
);

export const marketAnalyses = pgTable(
  'market_analyses',
  {
    id: serial('id').primaryKey(),
    symbol: text('symbol').notNull(),
    timeframe: text('timeframe').notNull(),

    // Core payload from your algorithms
    analysis: jsonb('analysis').notNull().default({}),

    // Optional extra payloads used by some endpoints
    indicators: jsonb('indicators').notNull().default({}),
    prediction: jsonb('prediction'),

    metadata: jsonb('metadata').notNull().default({}),

    timestamp: timestamp('timestamp', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('market_analyses_symbol_timeframe_timestamp_idx').on(
      table.symbol,
      table.timeframe,
      table.timestamp
    ),
  ]
);

export type CandleRow = typeof candles.$inferSelect;
export type NewCandleRow = typeof candles.$inferInsert;

export type MarketAnalysisRow = typeof marketAnalyses.$inferSelect;
export type NewMarketAnalysisRow = typeof marketAnalyses.$inferInsert;
