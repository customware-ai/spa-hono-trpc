import { useState, useCallback } from 'react';
import type { ZodSchema } from 'zod';
import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { ValidationError } from '../types/errors';

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T) => void;
  validate: () => Result<T, ValidationError[]>;
  reset: () => void;
  isValid: boolean;
}

export function useForm<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  initialValues: T
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldValue = useCallback(
    (field: keyof T, value: T[keyof T]): void => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear error when value changes
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    []
  );

  const setFieldTouched = useCallback((field: keyof T): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): Result<T, ValidationError[]> => {
    const result = schema.safeParse(values);

    if (result.success) {
      setErrors({});
      return ok(result.data);
    }

    const newErrors: Record<string, string> = {};
    const validationErrors: ValidationError[] = result.error.issues.map(
      (issue) => {
        const field = issue.path.join('.');
        newErrors[field] = issue.message;
        return {
          type: 'VALIDATION_ERROR' as const,
          field,
          message: issue.message,
        };
      }
    );

    setErrors(newErrors);
    return err(validationErrors);
  }, [schema, values]);

  const reset = useCallback((): void => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validate,
    reset,
    isValid,
  };
}
