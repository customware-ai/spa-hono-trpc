import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../db';
import { createApiResponse } from '../utils/api';
import { validate } from '../utils/validate';
import { CreateUserSchema } from '../schemas';
import { logger } from '../utils/logger';

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('id');

  if (userId) {
    const result = await getUser(parseInt(userId));
    return createApiResponse(result);
  }

  const result = await getUsers();
  return createApiResponse(result);
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
        const validated = validate(CreateUserSchema, data);
        if (validated.isErr()) {
          logger.warn('User validation failed', { errors: validated.error });
          return Response.json(
            { success: false, errors: validated.error },
            { status: 400 }
          );
        }
        const result = await createUser(validated.value);
        return createApiResponse(result);
      }

      case 'update': {
        const { id, name, email } = data;
        if (!id || !name || !email) {
          return Response.json(
            { error: 'Missing required fields: id, name, email' },
            { status: 400 }
          );
        }
        const result = await updateUser(parseInt(String(id)), String(name), String(email));
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
        const result = await deleteUser(parseInt(String(id)));
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
