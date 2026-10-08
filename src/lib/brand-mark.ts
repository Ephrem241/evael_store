// The Evael Store mark: a gold shopping bag with a deep burgundy "E" on its
// front, on a rounded burgundy tile (turned around — a gold tile, burgundy bag
// — on dark surfaces). It is the logo beside the wordmark in the header,
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
// can't read CSS variables. Keep the two in step. (One of the two documented
// places outside globals.css with hex colours; the other is the email
// templates, for the same reason.)
// Also used by global-error.tsx, which renders without the app's stylesheet.
export const BRAND_COLORS = {
  primary: "#900018",
  primaryStrong: "#7E061E",
  primaryInk: "#7E061E",
  primaryDeepest: "#420612",
  gold: "#D29C4E",
  goldInk: "#8A5A12",
  background: "#FBF6F0",
  text: "#1A1414", // i18n-ignore: a colour (the text colour), not words
  textSecondary: "#66605C",
  white: "#FFFFFF",
} as const
