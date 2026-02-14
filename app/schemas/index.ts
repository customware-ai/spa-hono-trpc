import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  created_at: z.string().optional(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, created_at: true });
export const UpdateUserSchema = UserSchema.partial().required({ id: true });

// User row type (from database with required id)
export const UserRowSchema = UserSchema.required({ id: true });

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserRow = z.infer<typeof UserRowSchema>;

// Task schemas
export const TaskSchema = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  completed: z.number().default(0),
  created_at: z.string().optional(),
});

export const CreateTaskSchema = TaskSchema.omit({ id: true, created_at: true, completed: true, status: true });
export const UpdateTaskSchema = TaskSchema.partial().required({ id: true });

// Task row type (from database with required fields)
export const TaskRowSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  description: z.string(),
  completed: z.number(),
  created_at: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskRow = z.infer<typeof TaskRowSchema>;

// API Response schemas
export const ApiErrorSchema = z.object({
  error: z.string(),
  field: z.string().optional(),
});

export const ApiSuccessSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
});

// SqlValue type for database values
export type SqlValue = number | string | Uint8Array | null;

// Loader data type (not using Zod inference due to SqlValue complexity)
export interface LoaderData {
  users: SqlValue[][];
  tasks: Record<number, SqlValue[][]>;
  error?: string;
}

// ============================================================
// Export Sales & CRM Schemas
// ============================================================
export * from './sales';
