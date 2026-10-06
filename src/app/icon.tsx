import { ImageResponse } from "next/og"

import { BrandMarkImage } from "@/lib/brand-mark-image"

// The browser-tab icon: the store's mark (a white bag with an orange "E" on a
// rounded orange tile), the same one the header shows. Generated at build time.
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <BrandMarkImage size={size.width} />
      </div>
    ),
    { ...size }
  )
}
