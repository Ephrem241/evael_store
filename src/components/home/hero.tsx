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

// The homepage's opening: the photographs (cross-fading, see HeroSlideshow)
// with the cream fading in from the left, and on it the eyebrow, the
// headline, its line and two buttons.
//
// The copy is the admin's (homepage_sections). Each line break in the
// headline is kept: the LAST line is the big gold one ("Made for Ethiopia."),
// in gold-display — at 24px+ bold it is large text, which needs 3:1 and gets
// 3.5:1 on cream. On desktop the lines before it are as big, in the text
// colour; on phones they become the small capitals over it ("MODERN
// SHOPPING."), where a two-line display headline wouldn't fit beside the
// photo. A one-line headline is drawn big, in the text colour. This is the
// page's one <h1>.
//
// Phones keep to the left half of the card, clear of the subject: no eyebrow,
// line or second button there. Instead, under the headline, the biggest
// discount really on sale (`dealPercent`; none when nothing is discounted),
// and the one button, a small black "SHOP NOW".
async function Hero({ settings, dealPercent }: { settings: HomepageSettings; dealPercent: number | null }) {
  const t = await getT()
  const lines = settings.heroHeadline.split("\n").filter((line) => line.trim() !== "")

  return (
    <HeroSlideshow photos={PHOTOS} labelledBy="hero-heading" flourish={t("home.hero.flourish")}>
      <div className="animate-fade-up max-lg:max-w-[52%] lg:max-w-[38rem]">
        <p className="mb-3 type-eyebrow text-gold-ink max-lg:hidden">{t("home.hero.eyebrow")}</p>
        <h1 id="hero-heading" className="font-display font-bold tracking-[-0.02em]">
          {lines.map((line, i) => {
            const last = i === lines.length - 1
            return (
              <span
                key={i}
                className={cn(
                  "block",
                  last
                    ? "text-[1.5rem] leading-[1.1] sm:text-[2.25rem] lg:text-[3.75rem] lg:leading-[1.05]"
                    : "text-[10px] text-charcoal max-lg:mb-1 max-lg:font-sans max-lg:font-semibold max-lg:tracking-[0.18em] max-lg:uppercase sm:text-xs lg:text-[3.75rem] lg:leading-[1.05]",
                  last && (lines.length > 1 ? "text-gold-display" : "text-charcoal")
                )}
              >
                {line}
              </span>
            )
          })}
        </h1>
        {dealPercent != null && (
          <p className="mt-1.5 text-sm font-extrabold tracking-wide text-sale uppercase sm:text-base lg:hidden">
            {t("home.savings.upTo", { percent: dealPercent })}
          </p>
        )}
        <p className="mt-5 max-w-md text-base leading-[1.55] text-charcoal/85 max-lg:hidden">{settings.heroSubtext}</p>
        <div className="mt-2.5 flex flex-wrap gap-3 lg:mt-8">
          <Button
            variant="hero"
            asChild
            className="max-lg:h-7.5 max-lg:rounded-sm max-lg:bg-charcoal max-lg:px-3.5 max-lg:text-[11px] max-lg:font-bold max-lg:tracking-wider max-lg:uppercase max-lg:hover:bg-brand-deep"
          >
            <Link href={settings.heroCtaHref}>
              {settings.heroCtaLabel}
              <ArrowRight aria-hidden className="max-lg:hidden" />
            </Link>
          </Button>
          <Button variant="outline-gold" asChild className="bg-background/90 max-lg:hidden">
            <Link href={settings.heroSecondaryCtaHref}>{settings.heroSecondaryCtaLabel}</Link>
          </Button>
        </div>
      </div>
    </HeroSlideshow>
  )
}

export { Hero }
