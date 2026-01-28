import { useState, useCallback, useEffect, type ReactElement } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import {
  getUsers,
  getAllTasks,
  createUserDirect,
  updateUser,
  deleteUser,
  createTaskDirect,
  updateTask,
  deleteTask,
} from "../db";
import { json } from "../utils/json";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import type { UserRow, TaskRow, LoaderData } from "../schemas";

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

export async function loader(_args: LoaderFunctionArgs): Promise<LoaderData> {
  const usersResult = await getUsers();
  const tasksResult = await getAllTasks();

  if (usersResult.isErr()) {
    return { users: [], tasks: {}, error: usersResult.error.message };
  }

  if (tasksResult.isErr()) {
    return { users: usersResult.value, tasks: {}, error: tasksResult.error.message };
  }

  return { users: usersResult.value, tasks: tasksResult.value };
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
      case "create": {
        const name = getFormString(formData, "name");
        const email = getFormString(formData, "email");
        if (!name || !email) {
          return json(
            { error: "Missing required fields: name, email" },
            { status: 400 }
          );
        }
        const result = await createUserDirect(name, email);
        if (result.isErr()) {
          return json({ error: result.error.message }, { status: 500 });
        }
        return json(result.value, { status: 201 });
      }

      case "update": {
        const id = getFormString(formData, "id");
        const name = getFormString(formData, "name");
        const email = getFormString(formData, "email");
        if (!id || !name || !email) {
          return json(
            { error: "Missing required fields: id, name, email" },
            { status: 400 }
          );
        }
        const result = await updateUser(parseInt(id), name, email);
        if (result.isErr()) {
          return json({ error: result.error.message }, { status: 500 });
        }
        return json(result.value);
      }

      case "delete": {
        const id = getFormString(formData, "id");
        if (!id) {
          return json({ error: "Missing required field: id" }, { status: 400 });
        }
        const result = await deleteUser(parseInt(id));
        if (result.isErr()) {
          return json({ error: result.error.message }, { status: 500 });
        }
        return json({ success: true });
      }

      case "create_task": {
        const userId = getFormString(formData, "userId");
        const title = getFormString(formData, "title");
        const description = getFormString(formData, "description");
        if (!userId || !title) {
          return json(
            { error: "Missing required fields: userId, title" },
            { status: 400 }
          );
        }
        const result = await createTaskDirect(
          parseInt(userId),
          title,
          description || ""
        );
        if (result.isErr()) {
          return json({ error: result.error.message }, { status: 500 });
        }
        return json(result.value, { status: 201 });
      }

      case "toggle_task": {
        const id = getFormString(formData, "id");
        const completed = getFormString(formData, "completed");
        if (!id) {
          return json({ error: "Missing required field: id" }, { status: 400 });
        }
        const result = await updateTask(
          parseInt(id),
          undefined,
          undefined,
          completed === "true"
        );
        if (result.isErr()) {
          return json({ error: result.error.message }, { status: 500 });
        }
        return json(result.value);
      }

      case "delete_task": {
        const id = getFormString(formData, "id");
        if (!id) {
          return json({ error: "Missing required field: id" }, { status: 400 });
        }
        const result = await deleteTask(parseInt(id));
        if (result.isErr()) {
          return json({ error: result.error.message }, { status: 500 });
        }
        return json({ success: true });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export default function DatabasePage(): ReactElement {
  const { users: loaderUsers, tasks: loaderTasks, error: loaderError } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const timer = setTimeout(() => setShowLoading(true), 100);
      return (): void => { clearTimeout(timer); };
    } else {
      setShowLoading(false);
    }
  }, [isSubmitting]);

  const users = (loaderUsers || []).map((row) => ({
    id: row[0] as number,
    name: row[1] as string,
    email: row[2] as string,
    created_at: row[3] as string,
  }));

  const tasks = Object.entries(loaderTasks || {}).reduce(
    (acc, [userId, taskRows]) => {
      acc[parseInt(userId)] = taskRows.map((row) => ({
        id: row[0] as number,
        user_id: row[1] as number,
        title: row[2] as string,
        description: row[3] as string,
        completed: row[4] as number,
        created_at: row[5] as string,
      }));
      return acc;
    },
    {} as Record<number, TaskRow[]>
  );

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState(loaderError || "");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const userFetcher = useFetcher();
  const taskFetcher = useFetcher();

  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });

  const handleCreateUser = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!userForm.name || !userForm.email) {
        setError("Please fill in all fields");
        return;
      }

      void userFetcher.submit(
        {
          action: editingUserId ? "update" : "create",
          id: editingUserId || "",
          ...userForm,
        },
        { method: "post" }
      );
    },
    [userForm, editingUserId, userFetcher]
  );

  const handleCreateTask = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (!taskForm.title || !selectedUserId) {
        setError("Please fill in required fields");
        return;
      }

      void taskFetcher.submit(
        { action: "create_task", userId: selectedUserId, ...taskForm },
        { method: "post" }
      );
    },
    [taskForm, selectedUserId, taskFetcher]
  );

  const handleDeleteUser = useCallback(
    (userId: number): void => {
      if (
        !confirm(
          "Are you sure you want to delete this user and all their tasks?"
        )
      ) {
        return;
      }

      void userFetcher.submit(
        { action: "delete", id: userId },
        { method: "post" }
      );
    },
    [userFetcher]
  );

  const handleToggleTask = useCallback(
    (taskId: number, completed: boolean): void => {
      if (!selectedUserId) return;

      void taskFetcher.submit(
        { action: "toggle_task", id: taskId, completed: String(!completed) },
        { method: "post" }
      );
    },
    [selectedUserId, taskFetcher]
  );

  const handleDeleteTask = useCallback(
    (taskId: number): void => {
      if (!selectedUserId) return;

      void taskFetcher.submit(
        { action: "delete_task", id: taskId },
        { method: "post" }
      );
    },
    [selectedUserId, taskFetcher]
  );

  const startEditingUser = useCallback((user: UserRow): void => {
    setEditingUserId(user.id || null);
    setUserForm({ name: user.name, email: user.email });
  }, []);

  const cancelEditUser = useCallback((): void => {
    setEditingUserId(null);
    setUserForm({ name: "", email: "" });
  }, []);

  useEffect(() => {
    if (taskFetcher.state === "idle" && taskFetcher.data) {
      setTaskForm({ title: "", description: "" });
    }
  }, [taskFetcher.state, taskFetcher.data]);

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 font-sans">
      <h1 className="text-2xl font-bold text-surface-800 mb-6">
        SQLite Database Management
      </h1>

      {error && (
        <Alert variant="danger" className="mb-5" dismissible onDismiss={(): void => setError("")}>
          {error}
        </Alert>
      )}

      {showLoading && (
        <div className="flex items-center justify-center gap-3 p-4 bg-info-light rounded-lg mb-5 text-info-dark font-medium">
          <div className="w-5 h-5 border-2 border-info border-t-transparent rounded-full animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Users Section */}
        <Card variant="default">
          <h2 className="text-lg font-semibold text-surface-800 mb-4 pb-2 border-b border-surface-100">
            Users
          </h2>

          <form onSubmit={handleCreateUser} className="flex flex-col gap-2.5 mb-5">
            <Input
              type="text"
              placeholder="Name"
              value={userForm.name}
              onChange={(e): void =>
                setUserForm({ ...userForm, name: e.target.value })
              }
            />
            <Input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e): void =>
                setUserForm({ ...userForm, email: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={userFetcher.state !== "idle"}
                loading={userFetcher.state === "submitting"}
                className="flex-1"
              >
                {editingUserId ? "Update User" : "Create User"}
              </Button>
              {editingUserId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelEditUser}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-2.5">
            {users.length === 0 ? (
              <p className="text-surface-500">No users yet</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className={`flex justify-between items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUserId === user.id
                      ? "bg-primary-50 border-primary-200"
                      : "bg-surface-50 border-surface-100 hover:bg-surface-100"
                  }`}
                  onClick={(): void => setSelectedUserId(user.id || null)}
                >
                  <div>
                    <strong className="text-surface-800">{user.name}</strong>
                    <br />
                    <small className="text-surface-500">{user.email}</small>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e): void => {
                        e.stopPropagation();
                        startEditingUser(user);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e): void => {
                        e.stopPropagation();
                        handleDeleteUser(user.id!);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tasks Section */}
        <Card variant="default">
          <h2 className="text-lg font-semibold text-surface-800 mb-4 pb-2 border-b border-surface-100">
            Tasks
          </h2>

          {selectedUserId ? (
            <>
              <form onSubmit={handleCreateTask} className="flex flex-col gap-2.5 mb-5">
                <Input
                  type="text"
                  placeholder="Task Title"
                  value={taskForm.title}
                  onChange={(e): void =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={taskForm.description}
                  onChange={(e): void =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                />
                <Button
                  type="submit"
                  disabled={taskFetcher.state !== "idle"}
                  loading={taskFetcher.state === "submitting"}
                >
                  Add Task
                </Button>
              </form>

              <div className="flex flex-col gap-2.5">
                {(tasks[selectedUserId] || []).length === 0 ? (
                  <p className="text-surface-500">No tasks yet</p>
                ) : (
                  (tasks[selectedUserId] || []).map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between items-start p-3 bg-surface-50 border border-surface-100 rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={task.completed === 1}
                            onChange={(): void =>
                              handleToggleTask(task.id!, task.completed === 1)
                            }
                            className="mt-1 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <strong
                              className={`text-surface-800 ${
                                task.completed === 1 ? "line-through opacity-60" : ""
                              }`}
                            >
                              {task.title}
                            </strong>
                            {task.description && (
                              <div className="text-sm text-surface-500 mt-0.5">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(): void => handleDeleteTask(task.id!)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="text-surface-500">Select a user to view their tasks</p>
          )}
        </Card>
      </div>
    </div>
  );
}
