import { z } from "zod";

/**
 * Schema for a complete user record.
 */
export const UserSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  created_at: z.string().optional(),
});

/**
 * Schema for creating a user.
 */
export const CreateUserSchema = UserSchema.omit({ id: true, created_at: true });

/**
 * Schema for updating an existing user.
 */
export const UpdateUserSchema = UserSchema.partial().required({ id: true });

/**
 * Schema for task records.
 */
export const TaskSchema = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  completed: z.number().default(0),
  created_at: z.string().optional(),
});

/**
 * Schema for creating a task.
 */
export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  completed: true,
  status: true,
});

/**
 * Schema for updating an existing task.
 */
export const UpdateTaskSchema = TaskSchema.partial().required({ id: true });

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
