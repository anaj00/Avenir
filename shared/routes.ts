import { z } from 'zod';
import { insertDesignSchema, designs, designParamsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  designs: {
    create: {
      method: 'POST' as const,
      path: '/api/designs' as const,
      input: insertDesignSchema,
      responses: {
        201: z.custom<typeof designs.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/designs/:id' as const,
      responses: {
        200: z.custom<typeof designs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/designs' as const,
      responses: {
        200: z.array(z.custom<typeof designs.$inferSelect>()),
      },
    },
    updateParams: {
      method: 'PATCH' as const,
      path: '/api/designs/:id/params' as const,
      input: designParamsSchema,
      responses: {
        200: z.custom<typeof designs.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type DesignInput = z.infer<typeof api.designs.create.input>;
export type DesignParamsInput = z.infer<typeof api.designs.updateParams.input>;
