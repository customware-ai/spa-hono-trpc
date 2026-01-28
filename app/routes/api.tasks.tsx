import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../db';
import { createApiResponse } from '../utils/api';
import { validate } from '../utils/validate';
import { CreateTaskSchema } from '../schemas';
import { logger } from '../utils/logger';

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(request.url);
  const taskId = url.searchParams.get('id');
  const userId = url.searchParams.get('userId');

  if (taskId) {
    const result = await getTask(parseInt(taskId));
    return createApiResponse(result);
  }

  if (userId) {
    const result = await getTasks(parseInt(userId));
    return createApiResponse(result);
  }

  return Response.json(
    { error: 'Missing required parameter: userId or id' },
    { status: 400 }
  );
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = await request.json();
    const action = data.action;

    switch (action) {
      case 'create': {
        const validated = validate(CreateTaskSchema, {
          user_id: data.userId,
          title: data.title,
          description: data.description,
          status: data.status || 'pending',
        });

        if (validated.isErr()) {
          logger.warn('Task validation failed', { errors: validated.error });
          return Response.json(
            { success: false, errors: validated.error },
            { status: 400 }
          );
        }

        const result = await createTask(validated.value);
        return createApiResponse(result);
      }

      case 'toggle': {
        const { id, completed } = data;
        if (!id) {
          return Response.json(
            { error: 'Missing required field: id' },
            { status: 400 }
          );
        }
        const result = await updateTask(
          parseInt(String(id)),
          undefined,
          undefined,
          typeof completed === 'boolean' ? completed : false
        );
        return createApiResponse(result);
      }

      case 'delete': {
        const { id } = data;
        if (!id) {
          return Response.json(
            { error: 'Missing required field: id' },
            { status: 400 }
          );
        }
        const result = await deleteTask(parseInt(String(id)));
        return createApiResponse(result);
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
