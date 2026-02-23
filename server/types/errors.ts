export type DatabaseError = {
  type: 'DATABASE_ERROR';
  message: string;
  originalError?: Error;
};

export type ValidationError = {
  type: 'VALIDATION_ERROR';
  field: string;
  message: string;
};

export type NotFoundError = {
  type: 'NOT_FOUND';
  resource: string;
  id: number | string;
  message: string;
};

export type AppError = DatabaseError | ValidationError | NotFoundError;
