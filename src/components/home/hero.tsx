import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import type { HomepageSettings } from "@/lib/services/homepage"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

const HERO_IMAGE = "/images/home/hero-evael.jpg"

// The homepage's opening: the headline, its line and two buttons, with the
// brand photograph (a shopper with an Evael bag among fashion, beauty, tech
// and home products).
//
// Desktop: the photograph fills the right of a full-width band, and its plain
// cream wall fades into the page under the text, which sits on the left — on
// the page's own off-white, so its contrast never depends on the picture.
// Phones: a rounded card with the text, and the photograph below it.
//
// The copy is the admin's (homepage_sections). Each line break in the headline
// is kept: the lines before the last are the lead-in, and the LAST line is the
// big one, in the brand orange — "Everything You Love. / Better Prices." The
// orange is the bright primary: at this size (bold, 36px+) it is WCAG large
// text, which needs 3:1 and gets it. A one-line headline is drawn big, in
// charcoal.
//
// Both responsive copies are always in the page (one hidden by CSS), and both
// are preloaded as the first thing painted, so each says it is 1vw wide where
// it is hidden (`sizes`): the hidden copy then costs a 16px thumbnail rather
// than a second full-size photograph. (A `vw` value, not `1px`: next/image
// only offers its smallest widths when `sizes` asks for a small share of the
// screen.) The text uses plain CSS animation, visible before JavaScript runs.
async function Hero({
  settings,
  showHeading = true,
  variant = "section",
}: {
  settings: HomepageSettings
  // False when a separate, always-present <h1> elsewhere on the page already
  // carries this text (see app/page.tsx) — this Hero is then one of two
  // responsive copies (mobile carousel / desktop), and a second literal <h1>
  // would exist in the DOM even while `display:none`, which is invalid
  // regardless of which copy happens to be visible at a given width.
  showHeading?: boolean
  // "slide": the first slide of the phone carousel — a rounded card inside the
  // page margins, with the photograph under the text.
  variant?: "section" | "slide"
}) {
  const t = await getT()
  const HeadlineTag = showHeading ? "h1" : "p"
  const lines = settings.heroHeadline.split("\n").filter((line) => line.trim() !== "")
  const slide = variant === "slide"

  const big = slide
    ? "text-[2.375rem] leading-[1.04] min-[400px]:text-[2.625rem] sm:text-5xl"
    : "text-[3.5rem] leading-[1.02] xl:text-[4.25rem]"
  const leadIn = slide
    ? "text-[1.625rem] leading-[1.15] min-[400px]:text-[1.75rem] sm:text-[2rem]"
    : "text-[2.5rem] leading-[1.1] xl:text-5xl"

  const headline = (
    <HeadlineTag
      {...(showHeading ? { id: "hero-heading" } : { "aria-hidden": true })}
      className="font-display font-bold tracking-[-0.035em] text-charcoal"
    >
      {lines.map((line, i) => {
        const last = i === lines.length - 1
        return (
          <span key={i} className={cn("block", last ? big : leadIn, last && lines.length > 1 && "mt-1 text-brand")}>
            {line}
          </span>
        )
      })}
    </HeadlineTag>
  )

  const actions = (
    <div className={cn("flex flex-wrap gap-3", slide ? "mt-5" : "mt-8")}>
      <Button size="lg" asChild>
        <Link href={settings.heroCtaHref}>
          {settings.heroCtaLabel}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href={settings.heroSecondaryCtaHref}>{settings.heroSecondaryCtaLabel}</Link>
      </Button>
    </div>
  )

  if (slide) {
    return (
      <section aria-labelledby="hero-heading" className="flex h-full w-full px-4 pt-4">
        <div className="flex w-full flex-col justify-between gap-5 overflow-hidden rounded-hero border border-border bg-card p-5 shadow-soft">
          <div className="animate-fade-up">
            {headline}
            <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal/80 sm:text-base">{settings.heroSubtext}</p>
            {actions}
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-subtle">
            <Image
              src={HERO_IMAGE}
              alt={t("home.hero.imageAlt")}
              fill
              preload
              sizes="(min-width: 1024px) 1vw, 100vw"
              className="object-cover object-[60%_45%]"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate left-1/2 -mt-6 flex min-h-[clamp(480px,38vw,640px)] w-screen -translate-x-1/2 items-center overflow-hidden border-b border-border/60 bg-background lg:-mt-10"
    >
      <div className="absolute inset-y-0 right-0 -z-10 w-[62%] max-w-[1120px]">
        <Image
          src={HERO_IMAGE}
          alt={t("home.hero.imageAlt")}
          fill
          preload
          sizes="(min-width: 1806px) 1120px, (min-width: 1024px) 62vw, 1vw"
          className="object-cover object-[55%_45%]"
        />
        {/* The photograph's plain wall fades into the page, so the text beside
            it always sits on the solid off-white. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-background)_0%,var(--color-background)_10%,transparent_28%)]"
        />
      </div>
      <Container className="py-12">
        <div className="max-w-[36rem] animate-fade-up">
          {headline}
          <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/80">{settings.heroSubtext}</p>
          {actions}
        </div>
      </Container>
    </section>
  )
}

export { Hero }
