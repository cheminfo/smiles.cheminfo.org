import { Type } from '@sinclair/typebox';
import type { FastifyReply } from 'fastify';

import { describeMolecule } from '../../../chemistry/describe.ts';
import { structureError } from '../../../chemistry/errorMessage.ts';
import { readStructure } from '../../../chemistry/parse.ts';
import type { InputFormat, Structure } from '../../../chemistry/types.ts';
import {
  errorSchema,
  inputFormatSchema,
  structureSchema,
} from '../schemas/structure.ts';
import type { FastifyTyped } from '../types.ts';

const inputSchema = Type.String({
  description: 'A SMILES, a SMARTS, a molfile or an idCode',
  minLength: 1,
  examples: ['CC(=O)Oc1ccccc1C(=O)O'],
});

/**
 * Register the single structure conversion routes.
 * @param fastify - Instance to register on.
 */
export default async function convertRoutes(fastify: FastifyTyped) {
  fastify.get(
    '/v1/convert',
    {
      schema: {
        tags: ['convert'],
        summary: 'Write one structure every way at once',
        description:
          'The page does this in the browser; the route is here so a script can do it too.',
        querystring: Type.Object({
          input: inputSchema,
          from: Type.Optional(inputFormatSchema),
        }),
        response: { 200: structureSchema, 400: errorSchema },
      },
    },
    (request, reply) => convert(request.query.input, request.query.from, reply),
  );

  fastify.post(
    '/v1/convert',
    {
      schema: {
        tags: ['convert'],
        summary: 'Write one structure every way at once',
        description:
          'The same as the GET, for a molfile — which does not fit in a query string.',
        body: Type.Object({
          input: inputSchema,
          from: Type.Optional(inputFormatSchema),
        }),
        response: { 200: structureSchema, 400: errorSchema },
      },
    },
    (request, reply) => convert(request.body.input, request.body.from, reply),
  );
}

/**
 * Read a structure and write it every way, or answer 400 with what stopped the
 * parser and where.
 * @param input - The structure as the caller wrote it.
 * @param from - How to read it.
 * @param reply - The reply, used only for the failure.
 * @returns The structure, or nothing once the failure has been sent.
 */
function convert(
  input: string,
  from: InputFormat | undefined,
  reply: FastifyReply,
): Structure | undefined {
  try {
    return describeMolecule(readStructure(input, from));
  } catch (error) {
    void reply.code(400).send(structureError(error));
    return undefined;
  }
}
