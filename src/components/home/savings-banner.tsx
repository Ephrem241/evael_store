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
      <section
        aria-labelledby="savings-heading"
        className="relative isolate flex min-h-[340px] flex-col justify-end overflow-hidden rounded-hero bg-brand-banner text-white sm:min-h-[320px] lg:min-h-[260px] lg:justify-center"
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
