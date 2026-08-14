import { Type } from '@sinclair/typebox';
import { create } from 'sdf-creator';

import {
  describeMolecule,
  writeMolecule,
} from '../../../chemistry/describe.ts';
import { structureErrorMessage } from '../../../chemistry/errorMessage.ts';
import { parseStructure } from '../../../chemistry/parse.ts';
import { splitList } from '../../../chemistry/splitList.ts';
import type { InputFormat } from '../../../chemistry/types.ts';
import { config } from '../config.ts';
import { errorSchema, inputFormatSchema } from '../schemas/structure.ts';
import type { FastifyTyped } from '../types.ts';

const listSchema = Type.String({
  description:
    'One structure per line, an SDF, or a CSV/TSV. Whatever follows the first space is taken as the name; in a delimited file the separator, the header row and the column holding the structures are worked out from the text, and every other column is returned as a field.',
  minLength: 1,
  examples: [
    'CCO ethanol\nc1ccccc1 benzene',
    'Name,SMILES,CAS\nethanol,CCO,64-17-5',
  ],
});

const outputFormatSchema = Type.Union(
  [
    Type.Literal('smiles'),
    Type.Literal('kekule'),
    Type.Literal('smarts'),
    Type.Literal('idcode'),
    Type.Literal('molfile'),
    Type.Literal('molfileV3'),
  ],
  { default: 'smiles' },
);

/**
 * Register the list routes: a whole list converted at once, and a list turned
 * into an SDF.
 * @param fastify - Instance to register on.
 */
export default async function batchRoutes(fastify: FastifyTyped) {
  fastify.post(
    '/v1/batch',
    {
      schema: {
        tags: ['convert'],
        summary: 'Convert a list of structures',
        description:
          'A line that cannot be read is reported in place rather than failing the call, so one bad SMILES in ten thousand does not cost the other 9999.',
        body: Type.Object({
          input: listSchema,
          from: Type.Optional(inputFormatSchema),
          to: Type.Optional(outputFormatSchema),
        }),
        response: {
          200: Type.Object({
            count: Type.Integer(),
            failed: Type.Integer(),
            entries: Type.Array(
              Type.Object({
                line: Type.Integer(),
                input: Type.String(),
                label: Type.Optional(Type.String()),
                fields: Type.Optional(
                  Type.Record(Type.String(), Type.String(), {
                    description:
                      'The other columns of the row, or the other fields of the SDF record, under the names the file gave them.',
                  }),
                ),
                output: Type.Optional(Type.String()),
                mf: Type.Optional(Type.String()),
                mw: Type.Optional(Type.Number()),
                error: Type.Optional(Type.String()),
              }),
            ),
          }),
          400: errorSchema,
        },
      },
    },
    (request, reply) => {
      const { input, from = 'auto', to = 'smiles' } = request.body;
      const lines = splitList(input);
      if (lines.length > config.maxBatch) {
        void reply.code(400).send({
          message: `This list holds ${lines.length} structures; ${config.maxBatch} is the most one call may convert.`,
        });
        return undefined;
      }

      let failed = 0;
      const entries = lines.map((entry) => {
        // Whatever the file said about the molecule is handed back with it,
        // so a caller who sent a CSV of eight columns still has the eight.
        const read = {
          line: entry.line,
          input: entry.structure,
          ...(entry.label === undefined ? {} : { label: entry.label }),
          ...(entry.fields === undefined ? {} : { fields: entry.fields }),
        };
        try {
          const molecule = parseStructure(entry.structure, from);
          const formula = molecule.getMolecularFormula();
          return {
            ...read,
            output: writeMolecule(molecule, to),
            mf: formula.formula,
            mw: formula.relativeWeight,
          };
        } catch (error) {
          failed++;
          return { ...read, error: structureErrorMessage(error) };
        }
      });

      return { count: entries.length, failed, entries };
    },
  );

  fastify.post(
    '/v1/sdf',
    {
      schema: {
        tags: ['convert'],
        summary: 'Turn a list of structures into an SDF file',
        description:
          'Every structure becomes one record, with its name, formula and canonical SMILES as fields, and whatever else its row or record carried. Lines that cannot be read are left out.',
        body: Type.Object({
          input: listSchema,
          from: Type.Optional(inputFormatSchema),
        }),
        response: {
          200: Type.String({ description: 'The SDF' }),
          400: errorSchema,
        },
      },
    },
    (request, reply) => {
      const { input, from = 'auto' } = request.body;
      const lines = splitList(input);
      if (lines.length > config.maxBatch) {
        void reply.code(400).send({
          message: `This list holds ${lines.length} structures; ${config.maxBatch} is the most one call may convert.`,
        });
        return undefined;
      }

      const { sdf } = create(buildRecords(lines, from));
      void reply.type('chemical/x-mdl-sdfile; charset=utf-8').send(sdf);
      return undefined;
    },
  );
}

function buildRecords(
  lines: ReturnType<typeof splitList>,
  from: InputFormat,
): Array<Record<string, string>> {
  const records: Array<Record<string, string>> = [];
  for (const entry of lines) {
    try {
      const structure = describeMolecule(parseStructure(entry.structure, from));
      records.push({
        ...entry.fields,
        molfile: structure.molfile,
        Name: entry.label ?? '',
        SMILES: structure.smiles,
        'Molecular Formula': structure.mf,
        'Molecular Weight': structure.mw.toFixed(4),
      });
    } catch {
      // A line nobody can read is not a record; /v1/batch is where a caller
      // finds out which ones those were.
    }
  }
  return records;
}
