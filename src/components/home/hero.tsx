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
      {/* Mobile: centered promo card matching the reference screenshot */}
      <div className="animate-fade-up flex flex-col items-center text-center lg:hidden">
        <span aria-hidden className="mb-1 text-gold text-lg">✦</span>
        <h1 id="hero-heading" className="space-y-1">
          <span className="block text-xs font-bold uppercase tracking-widest text-charcoal/80">
            {lines[0] ?? settings.heroCtaLabel}
          </span>
          <span className="flex items-baseline justify-center gap-1.5 font-display font-black text-charcoal">
            <span className="text-xs uppercase font-extrabold tracking-tight">{t("home.hero.upToPrefix")}</span>
            <span className="text-3xl sm:text-4xl leading-none font-black text-charcoal">50%</span>
            <span className="text-xs uppercase font-extrabold tracking-tight">{t("home.hero.offSuffix")}</span>
          </span>
        </h1>
        <Button asChild size="sm" className="mt-2.5 h-8.5 rounded-full bg-charcoal px-5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-deep active:scale-95">
          <Link href={settings.heroCtaHref}>
            {settings.heroCtaLabel}
          </Link>
        </Button>
      </div>

      {/* Desktop: original full-bleed layout */}
      <div className="animate-fade-up hidden lg:block lg:max-w-[38rem]">
        <p className="mb-3 type-eyebrow text-gold-ink">{t("home.hero.eyebrow")}</p>
        <p className="font-display font-bold tracking-[-0.02em]">
          {lines.map((line, i) => {
            const last = i === lines.length - 1
            const lead = !last
            return (
              <span
                key={i}
                className={cn(
                  "block",
                  lead ? "text-[3.75rem] leading-[1.05]" : "text-[3.75rem] leading-[1.05]",
                  last && (lines.length > 1 ? "text-gold-display" : "text-charcoal")
                )}
              >
                {line}
              </span>
            )
          })}
        </p>
        <p className="mt-5 text-base leading-[1.55] text-charcoal/85 max-w-md">{settings.heroSubtext}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link href={settings.heroCtaHref}>
              {settings.heroCtaLabel}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button variant="outline-gold" asChild className="bg-background/90">
            <Link href={settings.heroSecondaryCtaHref}>{settings.heroSecondaryCtaLabel}</Link>
          </Button>
        </div>
      </div>
    </HeroSlideshow>
  )
}

export { Hero }
