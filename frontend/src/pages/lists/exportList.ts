import { create } from 'sdf-creator';

import { writeMolecule } from '../../../../chemistry/describe.ts';

import type { ShownRow } from './shownRows.ts';

/** What a converted list can be handed back as. */
export type ExportFormat = 'text' | 'csv' | 'sdf';

export interface ExportFile {
  name: string;
  mime: string;
  content: string;
}

/**
 * Write a list out — the whole list, or whatever a query narrowed it to.
 *
 * The SDF is assembled by `sdf-creator` rather than by hand: the `$$$$`
 * terminators, the `>  <field>` headers and the blank lines between them are
 * exactly the sort of thing that is written wrong once and then debugged
 * forever.
 * @param rows - The rows the table is showing, failures included.
 * @param format - Which file to write.
 * @param baseName - What to call it, without an extension.
 * @returns The file, ready to be handed to the browser.
 */
export function exportList(
  rows: readonly ShownRow[],
  format: ExportFormat,
  baseName = 'structures',
): ExportFile {
  switch (format) {
    case 'csv':
      return {
        name: `${baseName}.csv`,
        mime: 'text/csv;charset=utf-8',
        content: toCsv(rows),
      };
    case 'sdf':
      return {
        name: `${baseName}.sdf`,
        mime: 'chemical/x-mdl-sdfile;charset=utf-8',
        content: create(toRecords(rows)).sdf,
      };
    case 'text':
      return {
        name: `${baseName}.smi`,
        mime: 'text/plain;charset=utf-8',
        content: toText(rows),
      };
    // no default
  }
}

/**
 * Hand a file to the browser.
 * @param file - What to save.
 */
export function download(file: ExportFile): void {
  const url = URL.createObjectURL(
    new Blob([file.content], { type: file.mime }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

function toText(rows: readonly ShownRow[]): string {
  const lines: string[] = [];
  for (const { row } of rows) {
    if (!row.molecule) continue;
    const smiles = writeMolecule(row.molecule, 'smiles');
    lines.push(row.label ? `${smiles} ${row.label}` : smiles);
  }
  return `${lines.join('\n')}\n`;
}

function toCsv(rows: readonly ShownRow[]): string {
  // Whatever the file said about a molecule follows the conversion out: a
  // chemist who came in with a CSV of eight columns leaves with those eight
  // columns and the structures written every way.
  const fields = fieldNames(rows);
  const lines = [
    ['line', 'input', 'name', 'smiles', 'kekule', 'idCode', 'mf', 'mw', 'error']
      .concat(fields)
      .map(escapeCsv)
      .join(','),
  ];

  for (const { row } of rows) {
    const molecule = row.molecule;
    const cells: Array<string | number> = [
      row.line,
      row.input,
      row.label ?? '',
      molecule ? writeMolecule(molecule, 'smiles') : '',
      molecule ? writeMolecule(molecule, 'kekule') : '',
      molecule ? writeMolecule(molecule, 'idcode') : '',
      row.mf ?? '',
      row.mw === undefined ? '' : row.mw.toFixed(4),
      row.error ?? '',
    ];
    for (const field of fields) cells.push(row.fields?.[field] ?? '');
    lines.push(cells.map(escapeCsv).join(','));
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Every field name the rows carry, in the order they first appear — which is
 * the order the file wrote its columns in.
 * @param rows - The rows the table is showing.
 * @returns The names, once each.
 */
function fieldNames(rows: readonly ShownRow[]): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const { row } of rows) {
    for (const name of Object.keys(row.fields ?? {})) {
      if (seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toRecords(rows: readonly ShownRow[]): Array<Record<string, string>> {
  const records: Array<Record<string, string>> = [];
  for (const { row } of rows) {
    if (!row.molecule) continue;
    records.push({
      ...row.fields,
      molfile: writeMolecule(row.molecule, 'molfile'),
      Name: row.label ?? '',
      SMILES: writeMolecule(row.molecule, 'smiles'),
      'Molecular Formula': row.mf ?? '',
      'Molecular Weight': row.mw === undefined ? '' : row.mw.toFixed(4),
    });
  }
  return records;
}
