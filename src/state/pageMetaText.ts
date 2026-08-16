import type { TutorialStep } from '../data/tutorial.ts';
import type { Exercise, ExerciseSet } from '../exercises/types.ts';

/** What a search result has room for under the title. */
const DESCRIPTION_MAX = 160;

/**
 * How a step of the tutorial is titled and described.
 * @param step - The step.
 * @param index - Its place in the tour, counted from 0.
 * @param total - How many steps there are.
 * @returns The title and the description of that address.
 */
export function describeStep(
  step: TutorialStep,
  index: number,
  total: number,
): { title: string; description: string } {
  const placing = ` Step ${index + 1} of ${total} of the SMILES tutorial, drawn as you edit it.`;
  return {
    title: `${step.title} — SMILES tutorial`,
    description: `${opening(plain(step.description), DESCRIPTION_MAX - placing.length)}${placing}`,
  };
}

/**
 * How a set of exercises is titled and described.
 * @param set - The set.
 * @returns The title and the description of that address.
 */
export function describeSet(set: ExerciseSet): {
  title: string;
  description: string;
} {
  const placing = ` ${set.exercises.length} exercises, marked in your browser.`;
  return {
    title: `SMILES exercises: ${set.title}`,
    description: `${opening(plain(set.description), DESCRIPTION_MAX - placing.length)}${placing}`,
  };
}

/**
 * How one exercise is titled and described. What is asked differs by kind, and
 * the title says which, so the same molecule in two sets is two pages rather
 * than one page written twice.
 * @param exercise - The exercise.
 * @returns The title and the description of that address.
 */
export function describeExercise(exercise: Exercise): {
  title: string;
  description: string;
} {
  if (exercise.kind === 'write') {
    return {
      title: `${exercise.title} — write its SMILES`,
      description: fit(
        `Write the SMILES of ${exercise.title}: the structure is drawn for you, and the answer is marked on the molecule, not on the string.`,
      ),
    };
  }

  if (exercise.kind === 'draw') {
    return {
      title: `${exercise.title} — draw it from its SMILES`,
      description: fit(
        `Read the SMILES of ${exercise.title} and draw the structure it describes. Any drawing of the right molecule is accepted.`,
      ),
    };
  }

  const placing = ` A SMARTS exercise, run against molecules on both sides of the line.`;
  return {
    title: `${exercise.title} — write a SMARTS`,
    description: `${opening(plain(exercise.description ?? ''), DESCRIPTION_MAX - placing.length)}${placing}`,
  };
}

/**
 * A description cut to what a search result shows, when what it is made of —
 * the name of a molecule, most often — makes it longer than that.
 * @param text - The composed description.
 * @returns The same sentence, within the room there is.
 */
function fit(text: string): string {
  return opening(text, DESCRIPTION_MAX);
}

/**
 * Prose as a search result shows it: the glossary markers resolved to the word
 * they wrap, the code ticks dropped, and the whitespace collapsed.
 * @param text - The authored description.
 * @returns The same sentences, in plain text.
 */
export function plain(text: string): string {
  return text
    .replaceAll(/\[\[(?<term>[^\]]+)\]\]/g, '$<term>')
    .replaceAll('`', '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * What a page opens with, kept to whole sentences so a search result does not
 * end mid-clause.
 * @param text - The prose to open with.
 * @param limit - How much room there is for it.
 * @returns The first sentences that fit, or a cut first one.
 */
export function opening(text: string, limit: number): string {
  if (text.length <= limit) return text;

  // A terminator ends a sentence only when a space follows it: the prose is
  // full of `C(=O)O` and `[nH]`, whose dots and marks end nothing.
  const terminator = /[.!?](?=\s|$)/g;
  let end = 0;
  for (
    let match = terminator.exec(text);
    match !== null;
    match = terminator.exec(text)
  ) {
    if (match.index >= limit) break;
    end = match.index + 1;
  }
  if (end > limit / 3) return text.slice(0, end);

  const cut = text.slice(0, limit);
  const space = cut.lastIndexOf(' ');
  return `${(space > limit / 2 ? cut.slice(0, space) : cut).replace(/[,;:]$/, '')}…`;
}
