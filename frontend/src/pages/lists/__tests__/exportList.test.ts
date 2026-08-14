import { expect, test } from 'vitest';

import { readList } from '../../../chemistry/structureList.ts';
import { exportList } from '../exportList.ts';
import { shownRows } from '../shownRows.ts';

const LIST = `ID,Name,SMILES,CAS
1,ethanol,CCO,64-17-5
2,benzene,c1ccccc1,71-43-2
3,nonsense,QQQ,`;

/**
 * The rows a conversion of the sample list leaves on screen.
 * @param text - The list to read.
 * @returns Every row of it, as the table shows them.
 */
async function rowsOf(text: string) {
  const { rows } = await readList(text);
  return shownRows(rows, null);
}

test('the SMILES file is one structure and its name per line', async () => {
  const file = exportList(await rowsOf(LIST), 'text');

  expect(file.name).toBe('structures.smi');
  expect(file.mime).toBe('text/plain;charset=utf-8');
  expect(file.content).toBe('CCO ethanol\nc1ccccc1 benzene\n');
});

test('a line that could not be read is not written out as a structure', async () => {
  // The row stays in the table so the chemist can see what failed; a .smi file
  // holding `QQQ` would be a file that does not read back.
  const file = exportList(await rowsOf(LIST), 'text');
  expect(file.content).not.toContain('QQQ');
  expect(file.content.split('\n').filter(Boolean)).toHaveLength(2);
});

test('a structure with no name is written on its own', async () => {
  const file = exportList(await rowsOf('CCO'), 'text');
  expect(file.content).toBe('CCO\n');
});

test('the CSV carries the columns the file came in with', async () => {
  const file = exportList(await rowsOf(LIST), 'csv');

  expect(file.name).toBe('structures.csv');
  expect(file.mime).toBe('text/csv;charset=utf-8');
  const lines = file.content.trimEnd().split('\n');
  expect(lines[0]).toBe(
    'line,input,name,smiles,kekule,idCode,mf,mw,error,ID,CAS',
  );
  expect(lines[1]).toBe(
    '2,CCO,ethanol,CCO,CCO,eMHAIh@,C2H6O,46.0686,,1,64-17-5',
  );
  expect(lines).toHaveLength(4);
});

test('a failed line keeps its place in the CSV, carrying its error', async () => {
  const file = exportList(await rowsOf(LIST), 'csv');
  const failed = file.content.trimEnd().split('\n').at(-1);
  expect(failed).toBe('4,QQQ,nonsense,,,,,,Unknown element label found.,3,');
});

test('a cell holding a comma or a quote is escaped rather than breaking the row', async () => {
  const file = exportList(
    await rowsOf('smiles,name\nCCO,"ethanol, absolute"'),
    'csv',
  );
  expect(file.content).toContain('"ethanol, absolute"');

  const quoted = exportList(
    await rowsOf('smiles,name\nCCO,"the ""good"" one"'),
    'csv',
  );
  expect(quoted.content).toContain('"the ""good"" one"');
});

test('the field columns are written in the order the file wrote them', async () => {
  // A chemist who came in with eight columns leaves with those eight columns,
  // in the order their spreadsheet had them.
  const file = exportList(
    await rowsOf('Name,SMILES,Batch,Supplier\nethanol,CCO,B3,Acme'),
    'csv',
  );
  expect(file.content.split('\n', 1)[0]).toBe(
    'line,input,name,smiles,kekule,idCode,mf,mw,error,Batch,Supplier',
  );
});

test('a field only some rows carry is still a column of its own', async () => {
  const file = exportList(await rowsOf('CCO ethanol\nc1ccccc1 benzene'), 'csv');
  expect(file.content.split('\n', 1)[0]).toBe(
    'line,input,name,smiles,kekule,idCode,mf,mw,error',
  );
});

test('the SDF is one record per structure, with its fields beside it', async () => {
  const file = exportList(await rowsOf(LIST), 'sdf');

  expect(file.name).toBe('structures.sdf');
  expect(file.mime).toBe('chemical/x-mdl-sdfile;charset=utf-8');
  const records = file.content.split('$$$$').filter((part) => part.trim());
  expect(records).toHaveLength(2);
  expect(file.content).toContain('>  <Name>');
  expect(file.content).toContain('ethanol');
  expect(file.content).toContain('>  <Molecular Formula>');
  expect(file.content).toContain('C2H6O');
  expect(file.content).toContain('>  <CAS>');
  expect(file.content).toContain('64-17-5');
  expect(file.content).toContain('V2000');
});

test('what a query left is what every download holds', async () => {
  // The table a conversion filled is the table a query narrows, so taking the
  // matches away is what a download after a search has to mean.
  const { rows } = await readList(LIST);
  const kept = shownRows(rows, [{ row: 1 }]);

  expect(exportList(kept, 'text').content).toBe('c1ccccc1 benzene\n');
  expect(exportList(kept, 'csv').content.trimEnd().split('\n')).toHaveLength(2);
  expect(
    exportList(kept, 'sdf')
      .content.split('$$$$')
      .filter((part) => part.trim()),
  ).toHaveLength(1);
});

test('the file is named whatever it is asked to be', async () => {
  const rows = await rowsOf('CCO ethanol');
  expect(exportList(rows, 'csv', 'my-set').name).toBe('my-set.csv');
  expect(exportList(rows, 'sdf', 'my-set').name).toBe('my-set.sdf');
  expect(exportList(rows, 'text', 'my-set').name).toBe('my-set.smi');
});

test('a list nothing could be read from writes an empty file, not a broken one', async () => {
  const rows = await rowsOf('QQQ nonsense');

  expect(exportList(rows, 'text').content).toBe('\n');
  expect(exportList(rows, 'sdf').content).toBe('');
  // The header is still written, so the file says what its columns are.
  expect(exportList(rows, 'csv').content.trimEnd().split('\n')).toHaveLength(2);
});
