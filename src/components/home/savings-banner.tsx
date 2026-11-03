import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

// "BIG SAVINGS. EVERY DAY.": the photograph (a burgundy panel on its left, a
// shopper with bags and a city beyond on its right) covers the whole card, a
// thin gold curve across it. The same side-by-side layout at every width: the
// words sit on the photo's own burgundy panel, blended into the band by a
// left-to-right fade, the shopper clear on the right. Phones get a 2:1 card
// (a sibling of the hero card) with smaller type and a compact button.
//
// The figure is the biggest discount really on sale right now (`percent`),
// so the banner can never promise more than exists; the page leaves the
// banner out when nothing is discounted.
async function SavingsBanner({ percent }: { percent: number }) {
  const t = await getT()

  return (
    <Reveal>
      <section
        aria-labelledby="savings-heading"
        className="relative isolate flex aspect-[2/1] items-center overflow-hidden rounded-hero bg-brand-banner text-white sm:aspect-auto sm:min-h-[220px] lg:min-h-[260px]"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/home/savings-banner.jpg"
            alt=""
            fill
            sizes="(min-width: 1280px) 1232px, 100vw"
            className="object-cover object-[100%_30%]"
          />
          {/* Burgundy behind the words, so they never sit on the busy photo.
              Wider on phones, where the words take more of the card. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-brand-banner from-40% via-brand-banner/80 via-55% to-transparent to-72% lg:from-35% lg:via-brand-banner/75 lg:via-48% lg:to-68%"
          />
        </div>
        <svg
          aria-hidden
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 left-[34%] h-full w-[38%] lg:left-[18%] lg:w-[45%]"
        >
          <path d="M0 190 C 180 170, 330 110, 600 10" fill="none" className="stroke-gold/70" strokeWidth="1.5" />
        </svg>
        <div className="relative max-w-[58%] space-y-1.5 px-4 py-4 sm:max-w-[50%] sm:space-y-2.5 sm:px-8 lg:max-w-[46%] lg:px-10 lg:py-8">
          <h2 id="savings-heading" className="type-banner text-balance text-white max-sm:text-lg">
            {t("home.savings.title")}
          </h2>
          <p className="leading-tight">
            <span className="block text-base font-bold text-gold sm:text-2xl">{t("home.savings.upTo", { percent })}</span>
            <span className="text-[11px] text-white/85 sm:text-sm">{t("home.savings.text")}</span>
          </p>
          <Button variant="gold" asChild className="mt-1 max-sm:h-8 max-sm:px-3 max-sm:text-xs">
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
