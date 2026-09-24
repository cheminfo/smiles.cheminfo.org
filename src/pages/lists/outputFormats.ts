import type { OutputFormat } from '../../chemistry/types.ts';

/** What every row can be written as, named the way the chooser names it. */
export const OUTPUT_FORMATS: Array<{ value: OutputFormat; label: string }> = [
  { value: 'smiles', label: 'Canonical SMILES' },
  { value: 'kekule', label: 'Kekulé SMILES' },
  { value: 'smarts', label: 'SMARTS' },
  { value: 'idcode', label: 'idCode' },
  { value: 'molfile', label: 'Molfile' },
  { value: 'molfileV3', label: 'Molfile V3000' },
];

/**
 * What a row's output is called, so a copied value says what it is.
 * @param format - The format the list is being written as.
 * @returns The name of that format.
 */
export function outputFormatLabel(format: OutputFormat): string {
  for (const entry of OUTPUT_FORMATS) {
    if (entry.value === format) return entry.label;
  }
  return format;
}
