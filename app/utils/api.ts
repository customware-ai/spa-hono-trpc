import type { Result } from 'neverthrow';
import type { AppError } from '../types/errors';
import { logger } from './logger';

export function createApiResponse<T>(
  result: Result<T, AppError | AppError[]>
): Response {
  return result.match(
    (data) => Response.json({ success: true, data }, { status: 200 }),
    (error) => {
      const errors = Array.isArray(error) ? error : [error];
      const status = getStatusCode(errors[0]);

      logger.warn('API error response', { errors, status });

      return Response.json(
        { success: false, errors: errors.map(formatError) },
        { status }
      );
    }
  );
}

function getStatusCode(error: AppError): number {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'DATABASE_ERROR':
      return 500;
    default:
      return 500;
  }
}

function formatError(
  error: AppError
): { type: string; message: string; field?: string } {
  return {
    type: error.type,
    message: error.message,
    field: 'field' in error ? error.field : undefined,
  };
}
