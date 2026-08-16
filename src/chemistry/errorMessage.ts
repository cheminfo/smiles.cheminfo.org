import type { StructureError } from './types.ts';

/**
 * openchemlib is compiled from Java, so a parse failure arrives as
 * `Class$S19: SmilesParser: dangling ring closure: 1; position:4` — a mangled
 * class name, the name of the parser, the reason, and sometimes the character
 * it stopped on. Only the last two mean anything to someone writing a SMILES,
 * and the position is what lets the page point at the mistake.
 * @param error - Whatever was thrown.
 * @returns The reason, and the offending character when one was named.
 */
export function structureError(error: unknown): StructureError {
  const raw = error instanceof Error ? error.message : String(error);
  const position = readPosition(raw);
  return position === undefined
    ? { message: clean(raw) }
    : { message: clean(raw), position };
}

/**
 * The reason alone, for a caller with nowhere to show a position.
 * @param error - Whatever was thrown.
 * @returns A sentence a chemist can act on.
 */
export function structureErrorMessage(error: unknown): string {
  return structureError(error).message;
}

function readPosition(raw: string): number | undefined {
  const match = /position\s*:\s*(?<index>\d+)/i.exec(raw);
  const index = match?.groups?.index;
  return index === undefined ? undefined : Number(index);
}

function clean(raw: string): string {
  const text = raw
    // The generated class name of the exception, which names nothing.
    .replace(/^\w*\$\w+:\s*/, '')
    // The parser that raised it: the page already says what it was reading.
    .replace(/^(?:SmilesParser|MolfileParser|Molfile\w*):\s*/, '')
    // The position is reported on its own, so it is dropped from the sentence
    // — with the words that only lead up to it, which would otherwise leave
    // "closing bracket at unexpected" hanging.
    .replace(/[;,]?\s*(?:at\s+unexpected\s+)?position\s*:\s*\d+\.?\s*$/i, '')
    .trim();
  if (!text) return 'This structure could not be read.';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
