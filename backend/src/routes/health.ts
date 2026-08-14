import { Type } from '@sinclair/typebox';
import { version } from 'openchemlib';

import type { FastifyTyped } from '../types.ts';

/**
 * Register the health route.
 * @param fastify - Instance to register on.
 */
export default async function healthRoutes(fastify: FastifyTyped) {
  fastify.get(
    '/v1/health',
    {
      schema: {
        tags: ['service'],
        summary: 'Liveness probe and the version of the chemistry toolkit',
        response: {
          200: Type.Object({
            status: Type.Literal('ok'),
            openchemlib: Type.String({
              description: 'Version doing the conversion, here and in the page',
            }),
          }),
        },
      },
    },
    () => ({ status: 'ok' as const, openchemlib: version }),
  );
}
