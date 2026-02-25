import { asc, desc, eq } from "drizzle-orm";
import { errAsync, ResultAsync } from "neverthrow";
import { CreateTaskSchema } from "../../contracts/core.js";
import type { DatabaseError, ValidationError } from "../../types/errors.js";
import { validate } from "../../utils/validate.js";
import { getDatabase, type SqlValue } from "../index.js";
import { tasks } from "../schemas.js";

/**
 * Maps a task row to the legacy array row shape.
 */
function mapTaskRowToArray(row: {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string | null;
}): SqlValue[] {
  return [
    row.id,
    row.user_id,
    row.title,
    row.description,
    row.completed ? 1 : 0,
    row.created_at,
  ];
}

/**
 * Converts unknown errors to the DatabaseError contract.
 */
function mapDatabaseError(message: string, error: unknown): DatabaseError {
  return {
    type: "DATABASE_ERROR",
    message,
    originalError: error instanceof Error ? error : undefined,
  };
}

/**
 * Creates a task from untyped input.
 */
export function createTask(
  data: unknown,
): ResultAsync<SqlValue[] | null, DatabaseError | ValidationError[]> {
  const validated = validate(CreateTaskSchema, data);
  if (validated.isErr()) {
    return errAsync(validated.error);
  }

  const { user_id, title, description } = validated.value;

  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.insert(tasks).values({
      user_id,
      title,
      description: description || "",
    });

    const taskRows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.user_id, user_id))
      .orderBy(desc(tasks.id))
      .limit(1);

    return taskRows[0] ? mapTaskRowToArray(taskRows[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to create task", error));

  return run();
}

/**
 * Creates a task from explicit arguments.
 */
export function createTaskDirect(
  userId: number,
  title: string,
  description = "",
): ResultAsync<SqlValue[] | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.insert(tasks).values({
      user_id: userId,
      title,
      description,
    });

    const taskRows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.user_id, userId))
      .orderBy(desc(tasks.id))
      .limit(1);

    return taskRows[0] ? mapTaskRowToArray(taskRows[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to create task", error));

  return run();
}

/**
 * Returns tasks for one user.
 */
export function getTasks(
  userId: number,
): ResultAsync<SqlValue[][], DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const taskRows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.user_id, userId))
      .orderBy(desc(tasks.id));

    return taskRows.map(mapTaskRowToArray);
  }, (error: unknown) => mapDatabaseError("Failed to get tasks", error));

  return run();
}

/**
 * Returns one task by id.
 */
export function getTask(
  id: number,
): ResultAsync<SqlValue[] | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const taskRows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    return taskRows[0] ? mapTaskRowToArray(taskRows[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to get task", error));

  return run();
}

/**
 * Returns all tasks grouped by user_id.
 */
export function getAllTasks(): ResultAsync<
  Record<number, SqlValue[][]>,
  DatabaseError
> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const taskRows = await db
      .select()
      .from(tasks)
      .orderBy(asc(tasks.user_id), desc(tasks.id));

    const grouped: Record<number, SqlValue[][]> = {};

    for (const row of taskRows) {
      if (!grouped[row.user_id]) {
        grouped[row.user_id] = [];
      }

      grouped[row.user_id].push(mapTaskRowToArray(row));
    }

    return grouped;
  }, (error: unknown) => mapDatabaseError("Failed to get all tasks", error));

  return run();
}

/**
 * Updates task fields and returns the updated task.
 */
export function updateTask(
  id: number,
  title?: string,
  description?: string,
  completed?: boolean,
): ResultAsync<SqlValue[] | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const updates: {
      title?: string;
      description?: string | null;
      completed?: boolean;
    } = {};

    if (title !== undefined) {
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (completed !== undefined) {
      updates.completed = completed;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(tasks).set(updates).where(eq(tasks.id, id));
    }

    const taskRows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    return taskRows[0] ? mapTaskRowToArray(taskRows[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to update task", error));

  return run();
}

/**
 * Deletes one task by id.
 */
export function deleteTask(
  id: number,
): ResultAsync<{ success: boolean }, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.delete(tasks).where(eq(tasks.id, id));

    return { success: true };
  }, (error: unknown) => mapDatabaseError("Failed to delete task", error));

  return run();
}
