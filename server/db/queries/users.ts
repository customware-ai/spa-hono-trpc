import { desc, eq } from "drizzle-orm";
import { errAsync, ResultAsync } from "neverthrow";
import { CreateUserSchema } from "../../contracts/core.js";
import type { DatabaseError, ValidationError } from "../../types/errors.js";
import { validate } from "../../utils/validate.js";
import { getDatabase, type SqlValue } from "../index.js";
import { users } from "../schemas.js";

/**
 * Maps a user row to the legacy array row shape.
 */
function mapUserRowToArray(row: {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
}): SqlValue[] {
  return [row.id, row.name, row.email, row.created_at];
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
 * Creates a user from untyped input after schema validation.
 */
export function createUser(
  data: unknown,
): ResultAsync<SqlValue[] | null, DatabaseError | ValidationError[]> {
  const validated = validate(CreateUserSchema, data);
  if (validated.isErr()) {
    return errAsync(validated.error);
  }

  const { name, email } = validated.value;

  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.insert(users).values({ name, email });

    const createdUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .orderBy(desc(users.id))
      .limit(1);

    return createdUser[0] ? mapUserRowToArray(createdUser[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to create user", error));

  return run();
}

/**
 * Creates a user from explicit arguments for simplified call-sites.
 */
export function createUserDirect(
  name: string,
  email: string,
): ResultAsync<SqlValue[] | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.insert(users).values({ name, email });

    const createdUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .orderBy(desc(users.id))
      .limit(1);

    return createdUser[0] ? mapUserRowToArray(createdUser[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to create user", error));

  return run();
}

/**
 * Returns all users ordered by latest first.
 */
export function getUsers(): ResultAsync<SqlValue[][], DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const userRows = await db.select().from(users).orderBy(desc(users.id));

    return userRows.map(mapUserRowToArray);
  }, (error: unknown) => mapDatabaseError("Failed to get users", error));

  return run();
}

/**
 * Returns one user by id.
 */
export function getUser(
  id: number,
): ResultAsync<SqlValue[] | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    const userRows = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return userRows[0] ? mapUserRowToArray(userRows[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to get user", error));

  return run();
}

/**
 * Updates a user and returns the updated row.
 */
export function updateUser(
  id: number,
  name: string,
  email: string,
): ResultAsync<SqlValue[] | null, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.update(users).set({ name, email }).where(eq(users.id, id));

    const userRows = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return userRows[0] ? mapUserRowToArray(userRows[0]) : null;
  }, (error: unknown) => mapDatabaseError("Failed to update user", error));

  return run();
}

/**
 * Deletes one user by id.
 */
export function deleteUser(
  id: number,
): ResultAsync<{ success: boolean }, DatabaseError> {
  const run = ResultAsync.fromThrowable(async () => {
    const db = getDatabase();

    await db.delete(users).where(eq(users.id, id));

    return { success: true };
  }, (error: unknown) => mapDatabaseError("Failed to delete user", error));

  return run();
}
