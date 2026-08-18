import type { ReferenceSection } from '../../data/reference/index.ts';
import { anchorHref } from '../../state/site.ts';

interface ContentsGroup {
  /** What the sections of the group have in common, empty when nothing does. */
  name: string;
  sections: Array<{ id: string; label: string }>;
}

/**
 * The sections one can jump to, the notation each belongs to said once.
 *
 * On the sheet an entry is a link to the section, so the contents can be
 * handed out one line at a time; in a dialog there is no address to link to,
 * so `onPick` scrolls the pane instead.
 * @param props - The sections listed, how a pick is honoured, and the class
 * the list takes.
 * @returns The contents list.
 */
export default function ReferenceContents(props: {
  sections: ReferenceSection[];
  /** Scrolls to the section instead of following its address. */
  onPick?: (id: string) => void;
  className?: string;
}) {
  const { sections, onPick, className } = props;
  return (
    <nav
      className={className ?? 'reference-contents no-print'}
      aria-label="Sections"
    >
      {groupSections(sections).map((group) => (
        <div key={group.name} className="reference-contents-group">
          {group.name === '' ? null : <span>{group.name}</span>}
          {group.sections.map((section) => (
            <a
              key={section.id}
              href={anchorHref(section.id)}
              onClick={
                onPick
                  ? (event) => {
                      event.preventDefault();
                      onPick(section.id);
                    }
                  : undefined
              }
            >
              {section.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

/**
 * The sections as the contents list them, so a row of twenty links does not
 * read `SMILES —` twelve times. The grouping is taken off the titles rather
 * than declared, so a section added to the sheet appears here by having a
 * title like the others.
 * @param sections - The sections listed.
 * @returns Them, grouped by what their titles start with.
 */
function groupSections(sections: ReferenceSection[]): ContentsGroup[] {
  const groups: ContentsGroup[] = [];
  for (const section of sections) {
    const separator = section.title.indexOf(' — ');
    const name = separator === -1 ? '' : section.title.slice(0, separator);
    const label =
      separator === -1
        ? section.title
        : section.title.slice(separator + ' — '.length);
    let group = groups.find((one) => one.name === name);
    if (group === undefined) {
      group = { name, sections: [] };
      groups.push(group);
    }
    group.sections.push({ id: section.id, label });
  }
  return groups;
}
