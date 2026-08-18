import { parseStructure } from '../chemistry/parse.ts';
import type { TutorialStep } from '../data/tutorial.ts';
import type { Exercise, ExerciseSet, SmartsCase } from '../exercises/types.ts';

/**
 * What a search result has room for under the title. Shorter than the minimum
 * is a snippet half used; longer than the maximum is a sentence cut off in the
 * result itself.
 */
const DESCRIPTION_MIN = 110;
const DESCRIPTION_MAX = 160;

/** What a title has room for, the site name being appended to it. */
const TITLE_MAX = 59;

/**
 * What a cut sentence must not end on: punctuation, or a word joining two.
 *
 * Both kinds are one alternation of a single repeated group, so a run mixing
 * them goes whole. Punctuation written as a suffix of the group could only ever
 * strip what follows the last joining word, and what a cut lands on is the
 * comma *before* one: `… ring bond number 1, so a` gives up `, so a`, not `,`.
 */
const DANGLING =
  /(?:\s*[,;:—–-]+|\s+(?:a|an|and|as|at|but|by|for|from|in|into|of|on|or|so|the|to|with))*\s*$/i;

/**
 * How a step of the tutorial is titled and described.
 *
 * The description is the step's own prose and nothing else. A sentence saying
 * which step of how many this is would be the same sentence on eighteen pages,
 * and it would take the room the notation needs: what a student searches for is
 * `c1ccccc1`, `[nH]`, `@` and `@@`, and each of those is in the sentences its
 * step opens with.
 * @param step - The step.
 * @returns The title and the description of that address.
 */
export function describeStep(step: TutorialStep): {
  title: string;
  description: string;
} {
  return {
    title: titled(step.title, [' — SMILES tutorial']),
    description: ownProse(plain(step.description)),
  };
}

/**
 * How a set of exercises is titled and described — in the words the set was
 * written with, whole, because they already say what the set asks and how it
 * is marked.
 * @param set - The set.
 * @returns The title and the description of that address.
 */
export function describeSet(set: ExerciseSet): {
  title: string;
  description: string;
} {
  return {
    title: titled(`SMILES exercises: ${set.title}`, ['']),
    description: ownProse(plain(set.description)),
  };
}

/**
 * How one exercise is titled and described. What is asked differs by kind, and
 * the title says which, so the same molecule in two sets is two pages rather
 * than one page written twice.
 *
 * What is written of the molecule is what the page itself shows of it: the
 * formula under the drawing when the SMILES is the answer, and the SMILES
 * itself when it is the question. A name alone left a hundred pages differing
 * by one word.
 * @param exercise - The exercise.
 * @returns The title and the description of that address.
 */
export function describeExercise(exercise: Exercise): {
  title: string;
  description: string;
} {
  if (exercise.kind === 'write') {
    return {
      title: titled(exercise.title, [' — write its SMILES']),
      description: fitted(
        `Write the SMILES of ${exercise.title}${formulaOf(exercise.smiles)}: the structure is drawn for you, and the answer is marked on the molecule, not the string.`,
      ),
    };
  }

  if (exercise.kind === 'draw') {
    return {
      title: titled(exercise.title, [
        ' — draw it from its SMILES',
        ' — draw it from SMILES',
      ]),
      description: fitted(
        `Draw ${exercise.title} from its SMILES, ${exercise.smiles}. Any drawing of the right molecule is accepted, whichever way it is laid out.`,
      ),
    };
  }

  return {
    title: titled(exercise.title, [' — write a SMARTS']),
    description: ownProse(
      plain(exercise.description ?? '') || asked(exercise.cases),
    ),
  };
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
 * A page's own prose, at the length a search result shows.
 *
 * Whole sentences when enough of them fit; the sentence after them, cut on a
 * word, when they do not fill the result on their own. What is never done is
 * stop short and make the room up with a sentence about the site — the page
 * carries on saying what it is about instead, which is what a reader is
 * searching for.
 * @param text - The page's own prose, in plain text.
 * @returns The description.
 */
function ownProse(text: string): string {
  const whole = wholeSentences(text, DESCRIPTION_MAX);
  if (whole.length >= DESCRIPTION_MIN || whole.length === text.length) {
    return whole;
  }
  return clipped(text, DESCRIPTION_MAX);
}

/**
 * A sentence written here rather than authored, kept to what a result shows.
 * @param text - The sentence.
 * @returns It, cut on a word when a long molecule name pushes it over.
 */
function fitted(text: string): string {
  return text.length <= DESCRIPTION_MAX ? text : clipped(text, DESCRIPTION_MAX);
}

/**
 * The molecular formula of a structure, read the way the exercise page reads
 * it to print under the drawing.
 * @param smiles - The molecule.
 * @returns `, C2H4N2O2`, or nothing at all when it cannot be read.
 */
function formulaOf(smiles: string): string {
  try {
    return `, ${parseStructure(smiles, 'smiles').getMolecularFormula().formula}`;
  } catch {
    return '';
  }
}

/**
 * What a pattern exercise asks, for one that carries no prose of its own.
 * @param cases - The molecules the pattern is run against.
 * @returns One sentence saying how many must match and how many must not.
 */
function asked(cases: readonly SmartsCase[]): string {
  let matching = 0;
  for (const one of cases) {
    if (one.shouldMatch) matching++;
  }
  return `Write a SMARTS that matches ${matching} of the ${cases.length} molecules below and leaves the other ${cases.length - matching} out. Every case is run against the pattern you hand in.`;
}

/**
 * A title of the length a tab has room for, the site name being appended to it.
 *
 * The endings are given fullest first: the name keeps as much of what it is
 * being asked for as fits, and is itself shortened only when no ending does.
 * @param name - What the page is called.
 * @param endings - What the title says of it, fullest first.
 * @returns The title.
 */
function titled(name: string, endings: readonly string[]): string {
  for (const ending of endings) {
    if (name.length + ending.length <= TITLE_MAX) return `${name}${ending}`;
  }

  const ending = endings.at(-1) ?? '';
  return `${clipped(name, TITLE_MAX - ending.length)}${ending}`;
}

/**
 * The whole sentences of a text that fit in the room there is.
 * @param text - The prose.
 * @param limit - How much room there is for it.
 * @returns Those sentences, or nothing when the first one is already too long.
 */
function wholeSentences(text: string, limit: number): string {
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

  return text.slice(0, end);
}

/**
 * A text cut to the room there is, on a word and marked as cut.
 *
 * A cut that lands on a comma, a dash or a word carrying no meaning of its own
 * gives them up too, so the last thing a search result shows is a word worth
 * reading rather than "or an".
 * @param text - The prose.
 * @param limit - How much room there is for it, the mark included.
 * @returns The opening words, ending in an ellipsis.
 */
function clipped(text: string, limit: number): string {
  const cut = text.slice(0, limit - 1);
  const space = cut.lastIndexOf(' ');
  const words = space > limit / 2 ? cut.slice(0, space) : cut;
  return `${words.replace(DANGLING, '')}…`;
}
