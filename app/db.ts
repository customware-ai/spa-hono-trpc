import initSqlJs, {
  type Database,
  type SqlJsStatic,
  type QueryExecResult,
} from "sql.js";
import * as fs from "fs";
import * as path from "path";
import { Result, ok, err } from "neverthrow";
import type { DatabaseError, ValidationError } from "./types/errors";
import { validate } from "./utils/validate";
import { CreateUserSchema, CreateTaskSchema } from "./schemas";

export type { Database, SqlJsStatic, QueryExecResult };
export type SqlValue = number | string | Uint8Array | null;

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

const SQLITE_DIR = path.join(process.cwd(), "..", "sqlite");
const DB_PATH = path.join(SQLITE_DIR, "database.db");

export async function saveDatabase(): Promise<void> {
  if (!db) return;
  try {
    // IMPORTANT: This is always required to save the database, do not remove it ever.
    // Always call this on every save.
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (error) {
    console.error("Failed to save database:", error);
  }
}

export async function initializeDatabase(): Promise<{
  db: Database;
  SQL: SqlJsStatic;
}> {
  if (db && SQL) return { db, SQL };

  SQL = await initSqlJs();

  // Ensure the sqlite directory exists
  if (!fs.existsSync(SQLITE_DIR)) {
    fs.mkdirSync(SQLITE_DIR, { recursive: true });
  }

  // Load database from file if it exists, otherwise create new
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH);
      db = new SQL.Database(data);
    } catch (error) {
      console.error(
        "Failed to load database from file, creating new one:",
        error,
      );
      db = new SQL.Database();
      initializeTables();
    }
  } else {
    db = new SQL.Database();
    initializeTables();
  }

  return { db, SQL };
}

function initializeTables(): void {
  if (!db) return;

  // Create sample table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  void saveDatabase();
}

export async function getDatabase(): Promise<{
  db: Database;
  SQL: SqlJsStatic;
}> {
  if (!db || !SQL) {
    return initializeDatabase();
  }
  return { db, SQL };
}

// User CRUD operations
export async function createUser(
  data: unknown,
): Promise<Result<SqlValue[] | null, DatabaseError | ValidationError[]>> {
  const validated = validate(CreateUserSchema, data);
  if (validated.isErr()) {
    return err(validated.error);
  }

  const { name, email } = validated.value;

  try {
    const { db } = await getDatabase();
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM users WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email],
    );
    await saveDatabase();
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to create user",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function createUserDirect(
  name: string,
  email: string,
): Promise<Result<SqlValue[] | null, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM users WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email],
    );
    await saveDatabase();
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to create user",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function getUsers(): Promise<Result<SqlValue[][], DatabaseError>> {
  try {
    const { db } = await getDatabase();
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM users ORDER BY id DESC",
    );
    return ok(result[0]?.values || []);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to get users",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function getUser(
  id: number,
): Promise<Result<SqlValue[] | null, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to get user",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function updateUser(
  id: number,
  name: string,
  email: string,
): Promise<Result<SqlValue[] | null, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name,
      email,
      id,
    ]);
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );
    await saveDatabase();
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to update user",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function deleteUser(
  id: number,
): Promise<Result<{ success: boolean }, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    db.run("DELETE FROM users WHERE id = ?", [id]);
    db.run("DELETE FROM tasks WHERE user_id = ?", [id]);
    await saveDatabase();
    return ok({ success: true });
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to delete user",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

// Task CRUD operations
export async function createTask(
  data: unknown,
): Promise<Result<SqlValue[] | null, DatabaseError | ValidationError[]>> {
  const validated = validate(CreateTaskSchema, data);
  if (validated.isErr()) {
    return err(validated.error);
  }

  const { user_id, title, description } = validated.value;

  try {
    const { db } = await getDatabase();
    db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [
      user_id,
      title,
      description || "",
    ]);
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [user_id],
    );
    await saveDatabase();
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to create task",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function createTaskDirect(
  userId: number,
  title: string,
  description: string = "",
): Promise<Result<SqlValue[] | null, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    db.run("INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)", [
      userId,
      title,
      description,
    ]);
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId],
    );
    await saveDatabase();
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to create task",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function getTasks(
  userId: number,
): Promise<Result<SqlValue[][], DatabaseError>> {
  try {
    const { db } = await getDatabase();
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC",
      [userId],
    );
    return ok(result[0]?.values || []);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to get tasks",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function getTask(
  id: number,
): Promise<Result<SqlValue[] | null, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
    );
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to get task",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function getAllTasks(): Promise<
  Result<Record<number, SqlValue[][]>, DatabaseError>
> {
  try {
    const { db } = await getDatabase();
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM tasks ORDER BY user_id, id DESC",
    );
    const tasks = result[0]?.values || [];

    const grouped: Record<number, SqlValue[][]> = {};
    for (const task of tasks) {
      const userId = task[1] as number;
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(task);
    }
    return ok(grouped);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to get all tasks",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function updateTask(
  id: number,
  title?: string,
  description?: string,
  completed?: boolean,
): Promise<Result<SqlValue[] | null, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    if (title !== undefined || description !== undefined) {
      db.run("UPDATE tasks SET title = ?, description = ? WHERE id = ?", [
        title ?? null,
        description ?? null,
        id,
      ]);
    }
    if (completed !== undefined) {
      db.run("UPDATE tasks SET completed = ? WHERE id = ?", [
        completed ? 1 : 0,
        id,
      ]);
    }
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
    );
    await saveDatabase();
    return ok(result[0]?.values[0] || null);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to update task",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export async function deleteTask(
  id: number,
): Promise<Result<{ success: boolean }, DatabaseError>> {
  try {
    const { db } = await getDatabase();
    db.run("DELETE FROM tasks WHERE id = ?", [id]);
    await saveDatabase();
    return ok({ success: true });
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to delete task",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

// Utility function to export database
export async function exportDatabase(): Promise<
  Result<Uint8Array, DatabaseError>
> {
  try {
    const { db } = await getDatabase();
    return ok(db.export());
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: "Failed to export database",
      originalError: error instanceof Error ? error : undefined,
    });
  }
}
