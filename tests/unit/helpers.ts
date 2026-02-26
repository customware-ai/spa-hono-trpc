import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

/**
 * Creates mock loader function args for testing.
 * React Router 7.13 requires unstable_pattern in the args type.
 */
export function createLoaderArgs(request: Request): LoaderFunctionArgs {
  return {
    request,
    params: {},
    context: {},
    unstable_pattern: '/',
  } as LoaderFunctionArgs;
}

/**
 * Creates mock action function args for testing.
 * React Router 7.13 requires unstable_pattern in the args type.
 */
export function createActionArgs(request: Request): ActionFunctionArgs {
  return {
    request,
    params: {},
    context: {},
    unstable_pattern: '/',
  } as ActionFunctionArgs;
}
