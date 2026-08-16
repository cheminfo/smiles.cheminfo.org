import type { Molecule } from 'openchemlib';
import { memo, useMemo } from 'react';
import { SvgRenderer } from 'react-ocl';

import { annotateRings } from '../chemistry/rings.ts';

interface StructureViewProps {
  molecule: Molecule;
  /**
   * Width of the drawing, in pixels.
   * @default 300
   */
  width?: number;
  /**
   * Height of the drawing, in pixels.
   * @default 200
   */
  height?: number;
  /** Atoms to paint, which is how a substructure match is shown. */
  atomHighlight?: number[];
  /**
   * The colour the highlighted atoms are painted.
   * @default '#a5d8ff'
   */
  atomHighlightColor?: string;
  /**
   * Number the rings: every ring atom carries the rings it belongs to above
   * it, and every ring bond is painted.
   * @default false
   */
  showRings?: boolean;
  /** Caption drawn inside the picture by openchemlib. */
  label?: string;
  /**
   * Crop the drawing to the atoms rather than centring it in the box.
   * @default true
   */
  autoCrop?: boolean;
}

/**
 * Draw a molecule.
 *
 * The drawing is an `<svg>` in the document — every atom and every bond is an
 * element with an id — rather than a raster canvas, which is what lets a match
 * be highlighted, an atom be hovered, and the picture stay sharp at any zoom
 * and in a print. The molecule is passed already parsed, so a page that draws
 * a hundred structures parses each of them once instead of once per render.
 * @param props - The molecule and how to draw it.
 * @returns The drawing.
 */
const StructureView = memo(function StructureView(props: StructureViewProps) {
  const {
    molecule,
    width = 300,
    height = 200,
    atomHighlight,
    atomHighlightColor = '#a5d8ff',
    showRings = false,
    label,
    autoCrop = true,
  } = props;

  // The numbers are custom labels written on the molecule, so they are added
  // to a copy of it — this one is drawn instead, and the one the page holds
  // stays as it was parsed.
  const rings = useMemo(
    () => (showRings ? annotateRings(molecule) : null),
    [molecule, showRings],
  );

  return (
    <SvgRenderer
      molecule={rings?.molecule ?? molecule}
      width={width}
      height={height}
      autoCrop={autoCrop}
      autoCropMargin={4}
      atomHighlight={atomHighlight}
      atomHighlightColor={atomHighlightColor}
      atomHighlightOpacity={0.7}
      bondHighlight={rings?.ringBonds}
      bondHighlightColor="#ffd8a8"
      bondHighlightOpacity={0.3}
      noCarbonLabelWithCustomLabel={showRings}
      label={label}
      suppressChiralText={false}
    />
  );
});

export default StructureView;
