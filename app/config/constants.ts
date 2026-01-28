export const APP_CONFIG = {
  name: 'React App DB',
  version: '1.0.0',
  api: {
    timeout: 10000,
    retries: 3,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  validation: {
    maxNameLength: 100,
    maxEmailLength: 255,
    maxDescriptionLength: 1000,
  },
} as const;
