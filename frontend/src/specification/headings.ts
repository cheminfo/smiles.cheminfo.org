export interface SpecHeading {
  /** The anchor the specification itself gives the heading. */
  id: string;
  /** 2 for a chapter, 3 for a section, 4 for a subsection. */
  level: 2 | 3 | 4;
  /** The number the specification prints, such as `3.1.2`. */
  number: string;
  /** The title, with its number and any markup taken off. */
  title: string;
  /** The anchor of the chapter it belongs to; a chapter names itself. */
  chapter: string;
}

const HEADING =
  /<h(?<level>[2-4]) id="(?<id>[^"]+)">(?<body>[\s\S]*?)<\/h\k<level>>/g;
const NUMBER = /^(?<number>\d+(?:\.\d+)*)\.?\s+/;

/**
 * Read the table of contents out of the specification.
 *
 * The document is imported as it was generated, so its headings are the only
 * description of its structure there is — and they already carry the anchors a
 * link has to use.
 * @param html - The specification, as served from `/spec/opensmiles.html`.
 * @returns Every chapter, section and subsection, in the order they are read.
 */
export function extractHeadings(html: string): SpecHeading[] {
  const headings: SpecHeading[] = [];
  let chapter = '';
  for (const match of html.matchAll(HEADING)) {
    const { level, id, body } = match.groups as {
      level: string;
      id: string;
      body: string;
    };
    const text = plainText(body);
    const number = NUMBER.exec(text)?.groups?.number ?? '';
    if (level === '2') chapter = id;
    headings.push({
      id,
      level: Number(level) as 2 | 3 | 4,
      number,
      title: text.slice(number.length).replace(/^\.\s*/, ''),
      chapter: chapter || id,
    });
  }
  return headings;
}

/**
 * The text of a heading: no tags, no entities, no doubled spaces. A heading is
 * allowed to hold `<code>` and typographic entities, and neither belongs in a
 * table of contents entry.
 * @param html - The inner HTML of one heading.
 * @returns What it reads as.
 */
function plainText(html: string): string {
  return decodeEntities(html.replaceAll(/<[^>]*>/g, ''))
    .replaceAll(/\s+/g, ' ')
    .trim();
}

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
};

/**
 * Turn the entities the 2007 generator emits back into characters. Only the
 * ones it actually uses are named; everything numeric is decoded outright.
 * @param text - Text holding HTML entities.
 * @returns The same text as characters.
 */
function decodeEntities(text: string): string {
  return text.replaceAll(
    /&(?:#(?<decimal>\d+)|#x(?<hexadecimal>[\da-f]+)|(?<name>[a-z]+));/gi,
    (
      entity: string,
      decimal: string | undefined,
      hexadecimal: string | undefined,
      name: string | undefined,
    ) => {
      if (decimal) return String.fromCodePoint(Number(decimal));
      if (hexadecimal) {
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      }
      return (name ? NAMED[name.toLowerCase()] : undefined) ?? entity;
    },
  );
}
