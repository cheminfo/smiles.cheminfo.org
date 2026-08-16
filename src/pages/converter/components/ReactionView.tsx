import { MF } from 'react-mf';

import type { DescribedComponent } from '../../../chemistry/readReactionInput.ts';
import StructureView from '../../../components/StructureView.tsx';

interface ReactionViewProps {
  components: DescribedComponent[];
}

/**
 * A reaction drawn the way it is written: the reactants, an arrow carrying
 * whatever sits between the two `>`, and the products.
 *
 * Each component is its own drawing rather than one picture of the whole
 * reaction, because that is what openchemlib holds — and it lets each side be
 * read, and each formula be stated, on its own.
 * @param props - The components of the reaction.
 * @returns The drawing.
 */
export default function ReactionView(props: ReactionViewProps) {
  const { components } = props;
  const reactants = components.filter((one) => one.role === 'reactant');
  const catalysts = components.filter((one) => one.role === 'catalyst');
  const products = components.filter((one) => one.role === 'product');

  return (
    <div className="reaction-view">
      <Side components={reactants} />
      <div className="reaction-arrow">
        {catalysts.length > 0 ? (
          <div className="reaction-agents">
            {catalysts.map((component) => (
              <Component
                key={component.id}
                component={component}
                width={90}
                height={60}
              />
            ))}
          </div>
        ) : null}
        <span className="reaction-arrow-glyph" aria-label="gives">
          →
        </span>
      </div>
      <Side components={products} />
    </div>
  );
}

function Side(props: { components: DescribedComponent[] }) {
  const { components } = props;
  return (
    <div className="reaction-side">
      {components.map((component, index) => (
        <div className="reaction-term" key={component.id}>
          {index > 0 ? <span className="reaction-plus">+</span> : null}
          <Component component={component} />
        </div>
      ))}
    </div>
  );
}

function Component(props: {
  component: DescribedComponent;
  width?: number;
  height?: number;
}) {
  const { component, width = 150, height = 110 } = props;
  const { structure, molecule } = component;
  return (
    <figure className="reaction-component">
      <StructureView molecule={molecule} width={width} height={height} />
      <figcaption>
        {/* A query component has no implicit hydrogens, so its formula would
            be fiction — the pattern itself is what it has to say. */}
        {structure.isQuery ? (
          <code>{structure.smarts}</code>
        ) : (
          <MF mf={structure.mf} />
        )}
      </figcaption>
    </figure>
  );
}
