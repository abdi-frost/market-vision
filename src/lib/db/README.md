# Database Configuration

This directory contains database connection utilities and configurations.

## Files

- `index.ts` - Postgres/Drizzle database client (with dev hot-reload caching)
- `schema.ts` - Drizzle schema definitions

## Usage

```typescript
import { db } from '@/lib/db';

// ... use Drizzle queries
// await db.select().from(...)
```

## Environment Variables

Make sure to set the following environment variable:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dev-mv
```


Neon example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
```
