import { memo, useMemo } from 'react';

import { readInput } from '../chemistry/readInput.ts';

import StructureView from './StructureView.tsx';

interface SmilesThumbProps {
  smiles: string;
  /**
   * Width of the drawing, in pixels.
   * @default 160
   */
  width?: number;
  /**
   * Height of the drawing, in pixels.
   * @default 100
   */
  height?: number;
}

/**
 * A small drawing of a structure given as text.
 *
 * Every example on the site goes through here rather than straight through
 * `SmilesSvgRenderer`, because an example is a SMARTS as often as it is a
 * SMILES and a reaction now and then. What cannot be drawn falls back to its
 * own string, which on a page of a hundred and forty examples is the
 * difference between a cheatsheet and a wall of red — and is honest besides:
 * a notation the specification allows and this toolkit does not implement is
 * worth seeing as text rather than as an error.
 * @param props - The notation and the size to draw it at.
 * @returns The drawing, or the notation itself when it cannot be drawn.
 */
const SmilesThumb = memo(function SmilesThumb(props: SmilesThumbProps) {
  const { smiles, width = 160, height = 100 } = props;

  if (smiles.includes('>')) {
    return <ReactionThumb smiles={smiles} width={width} height={height} />;
  }
  return <MoleculeThumb smiles={smiles} width={width} height={height} />;
});

export default SmilesThumb;

function MoleculeThumb(props: Required<SmilesThumbProps>) {
  const { smiles, width, height } = props;
  const result = useMemo(() => readInput(smiles), [smiles]);

  if (!result.ok) {
    return <code className="smiles-thumb-fallback">{smiles}</code>;
  }
  return (
    <StructureView
      molecule={result.molecule}
      width={width}
      height={height}
      autoCrop
    />
  );
}

/**
 * A reaction: the components of each side drawn in a row, with the arrow drawn
 * where the two `>` are.
 *
 * openchemlib refuses a reaction SMILES in its molecule parser, so the string
 * is split here — reactants, agents, products — and each component drawn on its
 * own, which is also how a chemist reads one.
 * @param props - The reaction and the size of one component.
 * @returns The row.
 */
function ReactionThumb(props: Required<SmilesThumbProps>) {
  const { smiles, width, height } = props;
  const [reactants = '', agents = '', products = ''] = smiles.split('>');

  return (
    <div className="reaction-thumb">
      <Side smiles={reactants} width={width} height={height} />
      <div className="reaction-arrow">
        <span aria-label="reacts to give">→</span>
        {agents ? <code>{agents}</code> : null}
      </div>
      <Side smiles={products} width={width} height={height} />
    </div>
  );
}

function Side(props: Required<SmilesThumbProps>) {
  const { smiles, width, height } = props;
  const components = splitComponents(smiles);
  if (components.length === 0) return <span className="muted">nothing</span>;

  return (
    <div className="reaction-side">
      {components.map((component) => (
        <div key={component.at} className="reaction-component">
          {component.at > 0 ? <span className="reaction-plus">+</span> : null}
          <MoleculeThumb
            smiles={component.smiles}
            width={width}
            height={height}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The components of one side of a reaction, each with where it starts.
 *
 * The offset is the key: two identical components on one side are the same
 * string twice, so nothing but the position tells the cells apart.
 * @param smiles - One side of the reaction.
 * @returns Each component and its offset in that side.
 */
function splitComponents(
  smiles: string,
): Array<{ smiles: string; at: number }> {
  const components: Array<{ smiles: string; at: number }> = [];
  let at = 0;
  for (const part of smiles.split('.')) {
    if (part) components.push({ smiles: part, at });
    at += part.length + 1;
  }
  return components;
}
