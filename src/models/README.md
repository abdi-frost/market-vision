# Database Models

This directory is kept for backwards compatibility. The project now uses Postgres + Drizzle.

## Models

- `User.ts` - Example user model
- `MarketAnalysis.ts` - Market analysis data model

## Usage

### Import Models

```typescript
import { User, MarketAnalysis } from '@/models';
import type { IUser, IMarketAnalysis } from '@/models';
```

### Creating Documents

```typescript
import { db } from '@/lib/db';
import { User } from '@/models';

await connectDB();

const user = await User.create({
  email: 'user@example.com',
  name: 'John Doe',
});
```

### Querying Documents

```typescript
import { MarketAnalysis } from '@/models';

// Find all analyses for a symbol
const analyses = await MarketAnalysis.find({ 
  symbol: 'EURUSD',
  timeframe: '1h'
})
  .sort({ timestamp: -1 })
  .limit(10);

// Find one document
const analysis = await MarketAnalysis.findById(id);
```

### Updating Documents

```typescript
const updated = await User.findByIdAndUpdate(
  id,
  { name: 'New Name' },
  { new: true, runValidators: true }
);
```

### Deleting Documents

```typescript
await User.findByIdAndDelete(id);
```

## Creating New Models

When creating a new model:

1. Define the TypeScript interface extending `Document`
2. Create the Schema with validation rules
3. Add appropriate indexes
4. Export the model using the pattern:
   ```typescript
   mongoose.models.ModelName || mongoose.model('ModelName', Schema)
   ```
5. Add exports to `index.ts`

## Best Practices

- Always use TypeScript interfaces for type safety
- Add validation rules in the schema
- Create indexes for frequently queried fields
- Use timestamps: true for automatic createdAt/updatedAt
- Transform toJSON to remove __v and format output
