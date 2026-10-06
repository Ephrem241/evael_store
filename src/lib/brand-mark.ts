// The Evael Store mark: a white shopping bag with an orange "E" on its front,
// on a rounded orange tile. It is the logo beside the wordmark in the header,
// footer and admin (layout/logo.tsx), and the favicon, app icon and share
// image (icon, apple-icon, opengraph-image) — all drawn from these paths.
//
// The bag's handle is thin and its sides taper, so even at favicon size it
// reads as a shopping bag rather than a padlock.
//
// All paths share one 44 × 44 viewBox, the tile's. Draw order: tile, handle
// (it tucks behind the bag), body, then the "E".

export const BRAND_MARK_SIZE = 44
export const BRAND_MARK_VIEWBOX = `0 0 ${BRAND_MARK_SIZE} ${BRAND_MARK_SIZE}`

export const BRAND_MARK = {
  /** The tile's corner radius: a quarter of its side. */
  tileRadius: 11,
  /** Stroked: the handle. */
  handle: "M16 16V12.6C16 8.9 18.6 6.5 22 6.5S28 8.9 28 12.6V16",
  handleWidth: 2.5,
  /** Filled: the bag, a slight trapezoid with rounded corners. */
  body: "M12.9 14H31.1Q32.7 14 32.85 15.6L34.55 34.8Q34.8 37.5 32.1 37.5H11.9Q9.2 37.5 9.45 34.8L11.15 15.6Q11.3 14 12.9 14Z",
  /** Stroked: the "E". */
  letter: "M25.9 20.85H18.1V30.65H25.9M18.1 25.75H23.7",
  letterWidth: 2.6,
} as const

// Hex copies of the palette in globals.css, for the image renderer, which
// can't read CSS variables. Keep the two in step.
export const BRAND_COLORS = {
  primary: "#E86A33",
  primaryStrong: "#C94F20",
  primarySoft: "#FFF1E8",
  primaryInk: "#BA4A1C",
  background: "#FAFAF7",
  text: "#171717",
  textSecondary: "#646B78",
  white: "#FFFFFF",
} as const
