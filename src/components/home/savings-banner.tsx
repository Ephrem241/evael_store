import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

// "BIG SAVINGS. EVERY DAY.": a deep burgundy band, the photograph (a shopper
// with bags, a city beyond) filling its right side, a thin gold curve across
// it. The words sit on the solid burgundy (white 14.6:1, gold 6.0:1), never
// on the picture. Phones: the words on the burgundy, the photograph under them.
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
        className="relative isolate overflow-hidden rounded-hero bg-brand-banner text-white lg:min-h-[200px]"
      >
        <div className="relative h-44 sm:h-56 lg:absolute lg:inset-y-0 lg:right-0 lg:-z-10 lg:h-auto lg:w-[72%]">
          <Image
            src="/images/home/savings-banner.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover object-[80%_45%] lg:object-[100%_45%]"
          />
          {/* The photograph fades into the burgundy, behind the words. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-banner to-transparent to-40% lg:bg-linear-to-r lg:from-brand-banner lg:from-5% lg:via-brand-banner/60 lg:via-25% lg:to-transparent lg:to-50%"
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
        <div className="relative space-y-3 px-5 pt-1 pb-6 lg:max-w-[46%] lg:space-y-2.5 lg:px-10 lg:py-8">
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
