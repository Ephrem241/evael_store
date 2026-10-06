import { ImageResponse } from "next/og"

import { BRAND_COLORS } from "@/lib/brand-mark"
import { BrandMarkImage } from "@/lib/brand-mark-image"

// The browser-tab icon: the store's bag mark (a white bag with an orange "E")
// on an orange tile. Generated at build time.
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_COLORS.primary,
          borderRadius: 8,
        }}
      >
        <BrandMarkImage
          height={26}
          body={BRAND_COLORS.white}
          rim={BRAND_COLORS.primarySoft}
          handle={BRAND_COLORS.white}
          letter={BRAND_COLORS.primaryStrong}
        />
      </div>
    ),
    { ...size }
  )
}
