import { BRAND_COLORS, BRAND_MARK, BRAND_MARK_SIZE, BRAND_MARK_VIEWBOX } from "@/lib/brand-mark"

// The mark (burgundy tile, gold bag, deep burgundy "E") as plain SVG with
// inline colours, for the generated images (next/og can't use Tailwind
// classes or CSS variables). `tileRadius` 0 gives a square tile, for icons the
// OS rounds itself.
function BrandMarkImage({ size, tileRadius = BRAND_MARK.tileRadius }: { size: number; tileRadius?: number }) {
  return (
    <svg width={size} height={size} viewBox={BRAND_MARK_VIEWBOX}>
      <rect width={BRAND_MARK_SIZE} height={BRAND_MARK_SIZE} rx={tileRadius} fill={BRAND_COLORS.primary} />
      <path
        d={BRAND_MARK.handle}
        fill="none"
        stroke={BRAND_COLORS.gold}
        strokeWidth={BRAND_MARK.handleWidth}
        strokeLinecap="round"
      />
      <path d={BRAND_MARK.body} fill={BRAND_COLORS.gold} />
      <path
        d={BRAND_MARK.letter}
        fill="none"
        stroke={BRAND_COLORS.primaryDeepest}
        strokeWidth={BRAND_MARK.letterWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { BrandMarkImage }
