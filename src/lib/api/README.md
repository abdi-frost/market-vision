# API Utilities

This directory contains utilities for creating unified API responses.

## Structure

- `types.ts` - TypeScript interfaces for API responses
- `response.ts` - Helper functions for creating API responses
- `index.ts` - Main export file

## Usage

### Success Response

```typescript
import { successResponse } from '@/lib/api';

export async function GET() {
  const data = { message: 'Hello World' };
  return successResponse(data);
}
```

### Error Response

```typescript
import { handleApiError, createApiError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    // Your logic here
    throw new Error('Something went wrong');
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Paginated Response

```typescript
import { paginatedResponse } from '@/lib/api';

export async function GET(request: Request) {
  const data = [{ id: 1 }, { id: 2 }];
  const pagination = { page: 1, limit: 10, total: 2 };
  
  return paginatedResponse(data, pagination);
}
```

## Response Format

All API responses follow this unified structure:

```typescript
{
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```
