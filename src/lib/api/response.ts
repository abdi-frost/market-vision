import { NextResponse } from 'next/server';
import { ApiResponse, ApiError } from './types';

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  metadata?: ApiResponse<T>['metadata']
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: ApiError
): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      details: error.details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: error.statusCode || 500 });
}

/**
 * Create a paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const response: ApiResponse<T[]> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
      },
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Common API error codes
 */
export const API_ERRORS = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    statusCode: 400,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    statusCode: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    statusCode: 403,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    statusCode: 404,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    statusCode: 422,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    statusCode: 503,
  },
} as const;

/**
 * Create a standardized error object
 */
export function createApiError(
  message: string,
  errorType: keyof typeof API_ERRORS = 'INTERNAL_SERVER_ERROR',
  details?: any
): ApiError {
  return {
    message,
    code: API_ERRORS[errorType].code,
    statusCode: API_ERRORS[errorType].statusCode,
    details,
  };
}

/**
 * Handle and format errors
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Check if it's already an ApiError
    if ('statusCode' in error && 'code' in error) {
      return errorResponse(error as ApiError);
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return errorResponse(
        createApiError(error.message, 'VALIDATION_ERROR', error)
      );
    }

    // Handle mongoose cast errors
    if (error.name === 'CastError') {
      return errorResponse(
        createApiError('Invalid ID format', 'BAD_REQUEST', error)
      );
    }

    // Generic error
    return errorResponse(
      createApiError(error.message, 'INTERNAL_SERVER_ERROR')
    );
  }

  // Unknown error type
  return errorResponse(
    createApiError('An unexpected error occurred', 'INTERNAL_SERVER_ERROR')
  );
}
