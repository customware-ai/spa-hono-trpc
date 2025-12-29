import initSqlJs, {
  type Database,
  type SqlJsStatic,
  type QueryExecResult,
} from "sql.js";
import * as fs from "fs";
import * as path from "path";
import { commitDatabase } from "../git.js";

export type { Database, SqlJsStatic, QueryExecResult };
export type SqlValue = number | string | Uint8Array | null;

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

const DB_PATH = path.join(process.cwd(), "database.db");

async function saveDatabase(): Promise<void> {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    // IMPORTANT: This is always required to save the database, do not remove it ever.
    // Always call this on every save.
    commitDatabase();
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

  saveDatabase();
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
  name: string,
  email: string,
): Promise<SqlValue[] | null> {
  const { db } = await getDatabase();
  try {
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
    const result: QueryExecResult[] = db.exec(
      "SELECT * FROM users WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email],
    );
    await saveDatabase();
    return result[0]?.values[0] || null;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
}

export async function getUsers(): Promise<SqlValue[][]> {
  const { db } = await getDatabase();
  const result: QueryExecResult[] = db.exec(
    "SELECT * FROM users ORDER BY id DESC",
  );
  return result[0]?.values || [];
}

export async function getUser(id: number): Promise<SqlValue[] | null> {
  const { db } = await getDatabase();
  const result: QueryExecResult[] = db.exec(
    "SELECT * FROM users WHERE id = ?",
    [id],
  );
  return result[0]?.values[0] || null;
}

export async function updateUser(
  id: number,
  name: string,
  email: string,
): Promise<SqlValue[] | null> {
  const { db } = await getDatabase();
  try {
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
    return result[0]?.values[0] || null;
  } catch (error) {
    throw new Error(`Failed to update user: ${error}`);
  }
}

export async function deleteUser(id: number): Promise<{ success: boolean }> {
  const { db } = await getDatabase();
  db.run("DELETE FROM users WHERE id = ?", [id]);
  db.run("DELETE FROM tasks WHERE user_id = ?", [id]);
  await saveDatabase();
  return { success: true };
}

// Task CRUD operations
export async function createTask(
  userId: number,
  title: string,
  description: string = "",
): Promise<SqlValue[] | null> {
  const { db } = await getDatabase();
  try {
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
    return result[0]?.values[0] || null;
  } catch (error) {
    throw new Error(`Failed to create task: ${error}`);
  }
}

export async function getTasks(userId: number): Promise<SqlValue[][]> {
  const { db } = await getDatabase();
  const result: QueryExecResult[] = db.exec(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC",
    [userId],
  );
  return result[0]?.values || [];
}

export async function getTask(id: number): Promise<SqlValue[] | null> {
  const { db } = await getDatabase();
  const result: QueryExecResult[] = db.exec(
    "SELECT * FROM tasks WHERE id = ?",
    [id],
  );
  return result[0]?.values[0] || null;
}

export async function getAllTasks(): Promise<Record<number, SqlValue[][]>> {
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
  return grouped;
}

export async function updateTask(
  id: number,
  title?: string,
  description?: string,
  completed?: boolean,
): Promise<SqlValue[] | null> {
  const { db } = await getDatabase();
  try {
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
    return result[0]?.values[0] || null;
  } catch (error) {
    throw new Error(`Failed to update task: ${error}`);
  }
}

export async function deleteTask(id: number): Promise<{ success: boolean }> {
  const { db } = await getDatabase();
  db.run("DELETE FROM tasks WHERE id = ?", [id]);
  await saveDatabase();
  return { success: true };
}

// Utility function to export database
export async function exportDatabase(): Promise<Uint8Array> {
  const { db } = await getDatabase();
  return db.export();
}
