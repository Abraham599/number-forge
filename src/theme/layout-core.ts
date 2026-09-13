/** Compact-width threshold. Regular width is the inner Duo / iPad class. */
export const COMPACT_WIDTH = 600;

/** Keep tappable work off the hinge when the layout splits. */
export const FOLD_GUTTER = 28;

export type AppLayout = {
  width: number;
  height: number;
  compact: boolean;
  regular: boolean;
  landscape: boolean;
  /** Split arrangement: side-by-side when wider than tall. */
  split: boolean;
  /** Extra hierarchy column on a regular-width inner display. */
  columns: boolean;
  /** Side chrome (tabs/toolbar) in landscape, matching Duo vertical controls. */
  sideChrome: boolean;
  foldGutter: number;
};

export function layoutFromSize(width: number, height: number): AppLayout {
  const compact = width < COMPACT_WIDTH;
  const landscape = width > height;
  const split = landscape;
  return {
    width,
    height,
    compact,
    regular: !compact,
    landscape,
    split,
    columns: !compact,
    sideChrome: landscape,
    foldGutter: split ? FOLD_GUTTER : 0,
  };
}
