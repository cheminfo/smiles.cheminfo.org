import { Type } from '@sinclair/typebox';

export const inputFormatSchema = Type.Union(
  [
    Type.Literal('auto'),
    Type.Literal('smiles'),
    Type.Literal('smarts'),
    Type.Literal('molfile'),
    Type.Literal('idcode'),
  ],
  {
    description:
      '`auto` reads a molfile, a line notation or an idCode, and tells a SMILES from a SMARTS by the query features it carries.',
    default: 'auto',
  },
);

export const structureSchema = Type.Object(
  {
    smiles: Type.String({ description: 'Canonical isomeric SMILES' }),
    kekule: Type.String({ description: 'The same molecule, Kekulé written' }),
    smarts: Type.String({ description: 'Read as a query pattern' }),
    idCode: Type.String({ description: 'openchemlib canonical identifier' }),
    coordinates: Type.String({ description: 'Where the atoms sit' }),
    molfile: Type.String(),
    mf: Type.String({ description: 'Molecular formula, Hill order' }),
    mw: Type.Number({ description: 'Average mass, g/mol' }),
    monoisotopicMass: Type.Number({ description: 'Monoisotopic mass, g/mol' }),
    atoms: Type.Integer(),
    bonds: Type.Integer(),
    isQuery: Type.Boolean({
      description: 'True when the structure carries query features',
    }),
    readAs: Type.Union([
      Type.Literal('smiles'),
      Type.Literal('smarts'),
      Type.Literal('molfile'),
      Type.Literal('idcode'),
    ]),
  },
  { $id: 'Structure' },
);

export const errorSchema = Type.Object({
  message: Type.String(),
  position: Type.Optional(
    Type.Integer({ description: 'Index of the offending character' }),
  ),
});
