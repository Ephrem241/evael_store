import { BRAND_COLORS, BRAND_MARK, BRAND_MARK_RATIO, BRAND_MARK_VIEWBOX } from "@/lib/brand-mark"

// The bag mark as plain SVG with inline colours, for the generated images
// (next/og can't use Tailwind classes or CSS variables). The defaults are the
// mark on a light background: an orange bag with a white "E".
function BrandMarkImage({
  height,
  body = BRAND_COLORS.primary,
  rim = BRAND_COLORS.primaryStrong,
  handle = BRAND_COLORS.text,
  letter = BRAND_COLORS.white,
}: {
  height: number
  body?: string
  rim?: string
  handle?: string
  letter?: string
}) {
  return (
    <svg width={Math.round(height * BRAND_MARK_RATIO)} height={height} viewBox={BRAND_MARK_VIEWBOX}>
      <path d={BRAND_MARK.handle} fill="none" stroke={handle} strokeWidth={BRAND_MARK.handleWidth} strokeLinecap="round" />
      <path d={BRAND_MARK.body} fill={body} />
      <path d={BRAND_MARK.rim} fill={rim} />
      <path
        d={BRAND_MARK.letter}
        fill="none"
        stroke={letter}
        strokeWidth={BRAND_MARK.letterWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { BrandMarkImage }
