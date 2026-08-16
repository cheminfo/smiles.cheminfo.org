import { MF } from 'react-mf';

import type {
  ElementCount,
  FormulaDifference,
} from '../../../chemistry/hints.ts';

/**
 * Which atoms are missing and which are in excess.
 *
 * Said as a difference rather than as two formulas side by side: "an oxygen
 * short" is a thing to go and find on the structure, where two formulas are a
 * puzzle to solve before the chemistry can even start.
 * @param props - The difference between the two formulas.
 * @returns One line of chemistry.
 */
export default function FormulaDifferenceLine(props: {
  formula: FormulaDifference;
}) {
  const { given, missing, extra } = props.formula;

  return (
    <p className="verdict-formula">
      Your structure is <MF mf={given} />
      {missing.length > 0 ? (
        <>
          {' — short of '}
          <ElementList elements={missing} />
        </>
      ) : null}
      {extra.length > 0 ? (
        <>
          {missing.length > 0 ? ', and carrying ' : ' — carrying '}
          <ElementList elements={extra} />
          {' too many'}
        </>
      ) : null}
      .
    </p>
  );
}

/**
 * `1 C and 3 O` — each element on its own, because the same atoms written as
 * one formula would read as a molecule that is not there.
 * @param props - The elements and how many of each.
 * @returns The list, joined the way it would be said.
 */
function ElementList(props: { elements: ElementCount[] }) {
  const { elements } = props;

  return (
    <>
      {elements.map(({ element, count }, index) => (
        <span key={element}>
          {index === 0 ? '' : index === elements.length - 1 ? ' and ' : ', '}
          {count} <MF mf={element} />
        </span>
      ))}
    </>
  );
}
