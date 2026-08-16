import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { structureError, structureErrorMessage } from '../errorMessage.ts';

test('strips the generated class name and the parser name', () => {
  expect(
    structureError(
      new Error(
        'Class$S19: SmilesParser: dangling ring closure: 1; position:4',
      ),
    ),
  ).toStrictEqual({ message: 'Dangling ring closure: 1', position: 4 });
});

test('reads the position however it is capitalised', () => {
  expect(
    structureError(
      new Error(
        'Class$S19: SmilesParser: unknown element label found. Position:0',
      ),
    ),
  ).toStrictEqual({ message: 'Unknown element label found.', position: 0 });
});

test('the words that only lead up to the position go with it', () => {
  expect(
    structureError(
      new Error(
        'Class$S19: SmilesParser: closing bracket at unexpected position:2',
      ),
    ),
  ).toStrictEqual({ message: 'Closing bracket', position: 2 });
});

test('an error with no position carries none', () => {
  const parsed = structureError(new Error('This idCode holds no atoms.'));
  expect(parsed).toStrictEqual({ message: 'This idCode holds no atoms.' });
});

test('reports the real position openchemlib gives, from a real failure', () => {
  // Not a fixture: the string is parsed for real, so this test fails if the
  // toolkit ever changes how it words or numbers its complaints.
  let caught: unknown;
  try {
    Molecule.fromSmiles('CCOQCC');
  } catch (error) {
    caught = error;
  }
  const parsed = structureError(caught);
  expect(parsed.position).toBe(3);
  expect(parsed.message).toBe('Unknown element label found.');
});

test('anything that is not an Error still says something', () => {
  expect(structureErrorMessage('boom')).toBe('Boom');
});

test('an error with nothing to say still produces a sentence', () => {
  // An error whose message is empty is exactly what this guards against; it is
  // built by emptying a real one rather than by constructing an empty one,
  // which is a thing no source file should ever be written to do.
  const silent = new Error('placeholder');
  silent.message = '';

  expect(structureErrorMessage(silent)).toBe(
    'This structure could not be read.',
  );
  expect(structureErrorMessage('')).toBe('This structure could not be read.');
});
