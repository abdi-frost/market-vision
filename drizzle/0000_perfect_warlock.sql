CREATE TABLE "candles" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text NOT NULL,
	"datetime" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"open" double precision NOT NULL,
	"high" double precision NOT NULL,
	"low" double precision NOT NULL,
	"close" double precision NOT NULL,
	"volume" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text NOT NULL,
	"analysis" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"indicators" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"prediction" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "candles_symbol_timeframe_datetime_uidx" ON "candles" USING btree ("symbol","timeframe","datetime");--> statement-breakpoint
CREATE INDEX "candles_symbol_timeframe_timestamp_idx" ON "candles" USING btree ("symbol","timeframe","timestamp");--> statement-breakpoint
CREATE INDEX "market_analyses_symbol_timeframe_timestamp_idx" ON "market_analyses" USING btree ("symbol","timeframe","timestamp");