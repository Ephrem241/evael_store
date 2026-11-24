// Quick fills for the admin's sale-event form: the names of the holidays and
// occasions Ethiopian shops usually run sales for, in both languages. They
// fill in the names and the tagline only. The admin always chooses the
// discount and the dates (holiday dates move from year to year, so none are
// assumed here).

export interface SalePreset {
  id: string
  name_en: string
  name_am: string
  tagline_en: string
  tagline_am: string
}

const TAGLINE_EN = "Holiday prices, for a limited time only."
const TAGLINE_AM = "የበዓል ዋጋ፣ ለተወሰነ ጊዜ ብቻ።"

export const SALE_PRESETS: SalePreset[] = [
  { id: "genna", name_en: "Genna Sale", name_am: "የገና ቅናሽ", tagline_en: TAGLINE_EN, tagline_am: TAGLINE_AM },
  { id: "timket", name_en: "Timket Sale", name_am: "የጥምቀት ቅናሽ", tagline_en: TAGLINE_EN, tagline_am: TAGLINE_AM },
  { id: "fasika", name_en: "Fasika (Easter) Sale", name_am: "የፋሲካ ቅናሽ", tagline_en: TAGLINE_EN, tagline_am: TAGLINE_AM },
  { id: "eid", name_en: "Eid Sale", name_am: "የኢድ ቅናሽ", tagline_en: TAGLINE_EN, tagline_am: TAGLINE_AM },
  {
    id: "enkutatash",
    name_en: "New Year (Enkutatash) Sale",
    name_am: "የእንቁጣጣሽ ቅናሽ",
    tagline_en: TAGLINE_EN,
    tagline_am: TAGLINE_AM,
  },
  { id: "meskel", name_en: "Meskel Sale", name_am: "የመስቀል ቅናሽ", tagline_en: TAGLINE_EN, tagline_am: TAGLINE_AM },
  {
    id: "black-friday",
    name_en: "Black Friday",
    name_am: "ብላክ ፍራይዴይ",
    tagline_en: "Our biggest prices drop of the year.",
    tagline_am: "የዓመቱ ትልቁ የዋጋ ቅናሽ።",
  },
  {
    id: "weekend",
    name_en: "Weekend Special",
    name_am: "የሳምንቱ መጨረሻ ልዩ ቅናሽ",
    tagline_en: "Special prices this weekend only.",
    tagline_am: "ልዩ ዋጋ በዚህ ሳምንት መጨረሻ ብቻ።",
  },
]
