import type { ZodSchema } from 'zod';
import { Result, ok, err } from 'neverthrow';
import type { ValidationError } from '../types/errors';

export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): Result<T, ValidationError[]> {
  const result = schema.safeParse(data);

  if (result.success) {
    return ok(result.data);
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    type: 'VALIDATION_ERROR',
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return err(errors);
}
