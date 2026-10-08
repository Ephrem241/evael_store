import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import type { HomepageSettings } from "@/lib/services/homepage"
import { Button } from "@/components/ui/button"
import { HeroSlideshow, type HeroPhoto } from "@/components/home/hero-slideshow"

// Each photo's subject stands on the right, beside a calm cream wall on the
// left where the words go; `position` keeps the subject in frame on a phone.
const PHOTOS: HeroPhoto[] = [
  { src: "/images/home/hero-shopper.jpg", position: "68% 40%" },
  { src: "/images/home/hero-couple.jpg", position: "75% 40%" },
  { src: "/images/home/hero-living-room.jpg", position: "72% 50%" },
]

// The homepage's opening: full-bleed photographs (cross-fading, see
// HeroSlideshow) with the cream fading in from the left, and on it the
// eyebrow, the headline, its line and two buttons.
//
// The copy is the admin's (homepage_sections). Each line break in the
// headline is kept: the LAST line is the big gold one ("Made for Ethiopia."),
// in gold-display — at 36px+ bold it is large text, which needs 3:1 and gets
// 3.5:1 on cream. On desktop the lines before it are as big, in the text
// colour; on phones they become the small capitals over it ("MODERN
// SHOPPING."), where a two-line display headline wouldn't fit beside the
// photo. A one-line headline is drawn big, in the text colour. This is the
// page's one <h1>. The fixed eyebrow shows on desktop only.
async function Hero({ settings }: { settings: HomepageSettings }) {
  const t = await getT()
  const lines = settings.heroHeadline.split("\n").filter((line) => line.trim() !== "")

  return (
    <HeroSlideshow photos={PHOTOS} labelledBy="hero-heading" flourish={t("home.hero.flourish")}>
      {/* Phones: the words keep to the left 60%, clear of the subject; the
          buttons may run on under the photo, on their own fills. */}
      <div className="animate-fade-up lg:max-w-[38rem]">
        <p className="mb-3 type-eyebrow text-gold-ink max-lg:hidden">{t("home.hero.eyebrow")}</p>
        <h1 id="hero-heading" className="font-display font-bold tracking-[-0.02em] max-lg:max-w-[60%] sm:max-lg:max-w-sm">
          {lines.map((line, i) => {
            const last = i === lines.length - 1
            const lead = !last
            return (
              <span
                key={i}
                className={cn(
                  "block",
                  lead
                    ? "text-charcoal max-lg:mb-1.5 max-lg:font-sans max-lg:text-[11px] max-lg:font-semibold max-lg:tracking-[0.18em] max-lg:uppercase lg:text-[3.75rem] lg:leading-[1.05]"
                    : "text-[2.25rem] leading-[1.1] lg:text-[3.75rem] lg:leading-[1.05]",
                  last && (lines.length > 1 ? "text-gold-display" : "text-charcoal")
                )}
              >
                {line}
              </span>
            )
          })}
        </h1>
        <p className="mt-3 text-sm leading-[1.55] text-charcoal/85 max-lg:max-w-[58%] sm:max-lg:max-w-sm lg:mt-5 lg:max-w-md lg:text-base">{settings.heroSubtext}</p>
        <div className="mt-5 flex flex-wrap gap-2.5 lg:mt-8 lg:gap-3">
          <Button variant="hero" asChild className="max-lg:px-4 max-lg:text-[13px]">
            <Link href={settings.heroCtaHref}>
              {settings.heroCtaLabel}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button variant="outline-gold" asChild className="bg-background/90 max-lg:px-4 max-lg:text-[13px]">
            <Link href={settings.heroSecondaryCtaHref}>{settings.heroSecondaryCtaLabel}</Link>
          </Button>
        </div>
      </div>
    </HeroSlideshow>
  )
}

export { Hero }
