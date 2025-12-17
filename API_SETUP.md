# API Structure & Postgres (Drizzle) Setup Guide

This document provides a complete overview of the API structure, Postgres (Drizzle) integration, and unified response system.

## 📁 Project Structure

```
src/
├── app/api/                    # API Routes
│   ├── fetch-data/            # Market data fetching
│   ├── forex/                 # Forex data
│   ├── market-analysis/       # Market analysis
│   └── analysis-history/      # Example CRUD with MongoDB
├── lib/
│   ├── api/                   # Unified API response utilities
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── response.ts       # Response helper functions
│   │   ├── index.ts          # Exports
│   │   └── README.md         # API utilities documentation
│   └── db/                    # Database connection (Postgres + Drizzle)
│       ├── index.ts          # Drizzle client
│       ├── schema.ts         # Drizzle schema
│       └── README.md         # Database documentation
└── types/                     # TypeScript type definitions
```

## 🚀 Quick Start

### 1. Install Dependencies

Drizzle + Postgres driver:
```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dev-mv
TWELVE_API_KEY=your_twelve_data_api_key_here
NODE_ENV=development
```

### 3. Get Postgres Connection String

**Option A: Local Postgres**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dev-mv
```

**Option B: Neon (Serverless Postgres)**
Neon provides a standard Postgres connection string. Use:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
```

## 📖 Unified API Response Structure

All API responses follow this consistent format:

### Success Response
```typescript
{
  success: true,
  data: {
    // Your response data
  },
  metadata: {
    timestamp: "2025-12-12T10:30:00.000Z",
    requestId?: "optional-request-id"
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    details?: {} // Optional additional details
  },
  metadata: {
    timestamp: "2025-12-12T10:30:00.000Z"
  }
}
```

### Paginated Response
```typescript
{
  success: true,
  data: [...],
  metadata: {
    timestamp: "2025-12-12T10:30:00.000Z",
    pagination: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10
    }
  }
}
```

## 🔧 Using the API Utilities

### Creating a Success Response

```typescript
import { successResponse } from '@/lib/api';

export async function GET() {
  const data = { message: 'Hello World' };
  return successResponse(data);
}
```

### Handling Errors

```typescript
import { handleApiError, createApiError, errorResponse } from '@/lib/api';

export async function POST(request: Request) {
  try {
    // Your logic
    throw new Error('Something went wrong');
  } catch (error) {
    return handleApiError(error); // Auto-formats error
  }
}

// Or create custom errors
return errorResponse(
  createApiError('Custom error message', 'VALIDATION_ERROR', { field: 'email' })
);
```

### Paginated Responses

```typescript
import { paginatedResponse } from '@/lib/api';

export async function GET(request: Request) {
  const data = [{ id: 1 }, { id: 2 }];
  const pagination = { page: 1, limit: 10, total: 50 };
  
  return paginatedResponse(data, pagination);
}
```

## 🗄️ Working with Postgres (Drizzle)

### Connecting to Database

```typescript
import { db } from '@/lib/db';

export async function GET() {
  // `db` is ready to use (configured via DATABASE_URL)
  // await db.select().from(...)
}
```

### Using Models

```typescript
import connectDB from '@/lib/db/mongodb';
import { MarketAnalysis } from '@/models';
import { successResponse, handleApiError } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const analyses = await MarketAnalysis.find({ symbol: 'EURUSD' })
      .sort({ timestamp: -1 })
      .limit(10);

    return successResponse({ analyses });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Creating Documents

```typescript
const analysis = await MarketAnalysis.create({
  symbol: 'EURUSD',
  timeframe: '1h',
  analysis: {
    trend: 'bullish',
    bias: 'long',
    confidence: 75
  },
  timestamp: new Date()
});
```

### Querying Documents

```typescript
// Find all
const all = await MarketAnalysis.find();

// Find with filters
const filtered = await MarketAnalysis.find({ 
  symbol: 'EURUSD',
  timeframe: '1h'
});

// Find one
const one = await MarketAnalysis.findById(id);
const oneByQuery = await MarketAnalysis.findOne({ symbol: 'EURUSD' });

// With pagination
const page = 1, limit = 10;
const skip = (page - 1) * limit;
const results = await MarketAnalysis.find()
  .sort({ timestamp: -1 })
  .skip(skip)
  .limit(limit);
```

### Updating Documents

```typescript
// Find and update
const updated = await MarketAnalysis.findByIdAndUpdate(
  id,
  { 'analysis.confidence': 80 },
  { new: true, runValidators: true }
);

// Update many
await MarketAnalysis.updateMany(
  { symbol: 'EURUSD' },
  { $set: { updated: true } }
);
```

### Deleting Documents

```typescript
await MarketAnalysis.findByIdAndDelete(id);
await MarketAnalysis.deleteMany({ symbol: 'EURUSD' });
```

## 📝 Creating New Models

1. Create a new file in `src/models/`:

```typescript
import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IYourModel extends Document {
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}

const YourModelSchema: Schema = new Schema(
  {
    field1: {
      type: String,
      required: true,
      index: true,
    },
    field2: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const YourModel: Model<IYourModel> =
  mongoose.models.YourModel || 
  mongoose.model<IYourModel>('YourModel', YourModelSchema);

export default YourModel;
```

2. Export from `src/models/index.ts`:

```typescript
export { default as YourModel } from './YourModel';
export type { IYourModel } from './YourModel';
```

## 🎯 Example API Route (Full CRUD)

See `src/app/api/analysis-history/route.ts` for a complete example of:
- GET with pagination and filtering
- POST to create documents
- DELETE to remove documents
- Using unified response structure
- MongoDB integration

## 🔍 Error Codes

Available error types:

- `BAD_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `INTERNAL_SERVER_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

## ✅ Best Practices

1. **Always connect to DB first**: Call `await connectDB()` at the start of routes that need DB access

2. **Use try-catch blocks**: Wrap DB operations in try-catch and use `handleApiError`

3. **Validate input**: Check for required fields before DB operations

4. **Use TypeScript types**: Import model interfaces for type safety

5. **Add indexes**: Add indexes to frequently queried fields in your schemas

6. **Handle pagination**: Use `paginatedResponse` for list endpoints

7. **Cache when appropriate**: Use response headers for client-side caching

## 🔗 Updated API Routes

All existing routes have been refactored to use the unified response structure:

- ✅ `/api/fetch-data` - Now uses `successResponse` and `handleApiError`
- ✅ `/api/forex` - Now uses unified response format
- ✅ `/api/market-analysis` - Now uses unified response format
- ✨ `/api/analysis-history` - Example CRUD route backed by Postgres

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🐛 Troubleshooting

### Database Connection Issues

1. Check your `DATABASE_URL` in `.env.local`
2. For Neon, ensure `?sslmode=require` is present
3. Verify username and password are correct
4. Check network connectivity

### Type Errors

1. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Check imports from `@/lib/api` and `@/models`

### Build Issues

```bash
pnpm run build
```

Check for any TypeScript errors and fix them before deploying.
