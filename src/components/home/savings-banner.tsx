import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

// "BIG SAVINGS. EVERY DAY.": the photograph (a burgundy panel on its left, a
// shopper with bags and a city beyond on its right) covers the whole card, a
// thin gold curve across it. The words sit on burgundy, never on the busy
// part of the picture: on desktop the photo's own panel, blended into the
// band by a fade; on phones a fade rising from the bottom, the shopper above.
//
// The figure is the biggest discount really on sale right now (`percent`),
// so the banner can never promise more than exists; the page leaves the
// banner out when nothing is discounted.
async function SavingsBanner({ percent }: { percent: number }) {
  const t = await getT()

  return (
    <Reveal>
      {/* Phones: a voucher strip, as in shopping apps — a red envelope with
          the real figure in it, the offer, and a black "OPEN NOW" button,
          with a small "Promotion" tag in the corner. */}
      <section
        aria-labelledby="savings-heading-mobile"
        className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-linear-to-r from-brand-soft to-gold/20 py-3 pr-3 pl-3.5 sm:hidden"
      >
        <span
          aria-hidden
          className="relative flex h-10 w-13 shrink-0 items-end justify-center overflow-hidden rounded-md bg-sale pb-1 shadow-xs"
        >
          {/* The envelope's flap. */}
          <span className="absolute inset-x-0 top-0 h-4 rounded-b-[50%] bg-white/20" />
          <span className="relative rounded-sm bg-white px-1 text-xs leading-tight font-black text-sale tabular-nums">
            {percent}%
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="savings-heading-mobile"
            className="truncate text-[13px] leading-tight font-extrabold tracking-wide text-charcoal uppercase"
          >
            {t("home.savings.upTo", { percent })}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-muted-text">{t("home.savings.title")}</p>
        </div>
        <Button
          asChild
          size="sm"
          className="h-8 shrink-0 rounded-sm bg-charcoal px-3 text-[11px] font-bold text-white uppercase hover:bg-brand-deep"
        >
          <Link href="/deals">{t("home.openNow")}</Link>
        </Button>
        <span className="absolute right-0 bottom-0 rounded-tl-md bg-muted-text px-1 text-[8px] leading-[1.4] text-white">
          {t("home.promotion")}
        </span>
      </section>

      {/* Desktop / Tablets: original photographic banner */}
      <section
        aria-labelledby="savings-heading"
        className="relative isolate hidden sm:flex min-h-[320px] flex-col justify-end overflow-hidden rounded-hero bg-brand-banner text-white lg:min-h-[260px] lg:justify-center"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/home/savings-banner.jpg"
            alt=""
            fill
            sizes="(min-width: 1280px) 1232px, 100vw"
            className="object-cover object-[78%_20%] sm:object-[100%_25%] lg:object-[100%_30%]"
          />
          {/* Burgundy behind the words, so they never sit on the busy photo. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-banner from-30% via-brand-banner/80 via-50% to-transparent to-75% lg:bg-linear-to-r lg:from-brand-banner lg:from-35% lg:via-brand-banner/75 lg:via-48% lg:to-transparent lg:to-68%"
          />
        </div>
        <svg
          aria-hidden
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 left-[18%] hidden h-full w-[45%] lg:block"
        >
          <path d="M0 190 C 180 170, 330 110, 600 10" fill="none" className="stroke-gold/70" strokeWidth="1.5" />
        </svg>
        <div className="relative space-y-3 px-5 pt-28 pb-6 lg:max-w-[46%] lg:space-y-2.5 lg:px-10 lg:py-8">
          <h2 id="savings-heading" className="type-banner text-white">
            {t("home.savings.title")}
          </h2>
          <p className="leading-tight">
            <span className="block text-2xl font-bold text-gold">{t("home.savings.upTo", { percent })}</span>
            <span className="text-sm text-white/85">{t("home.savings.text")}</span>
          </p>
          <Button variant="gold" asChild className="mt-1">
            <Link href="/deals">
              {t("home.savings.cta")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </Reveal>
  )
}

export { SavingsBanner }
