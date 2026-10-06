import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

// The promotional banner: a sunlit open-plan room filling the band, and the
// copy on a warm off-white wash at its left, so the words never depend on the
// picture for contrast. Light on purpose — the page's one dark band is the footer.
async function LifestyleBanner() {
  const t = await getT()

  return (
    <Reveal>
      <section
        aria-labelledby="lifestyle-heading"
        className="relative isolate overflow-hidden rounded-hero border border-border bg-brand-soft lg:min-h-[380px]"
      >
        <div className="relative z-10 flex flex-col items-start px-6 py-9 sm:px-10 lg:min-h-[380px] lg:w-[46%] lg:justify-center lg:py-12 lg:pl-14">
          <span aria-hidden className="mb-4 h-1 w-12 rounded-full bg-brand" />
          <h2
            id="lifestyle-heading"
            className="font-display text-3xl leading-[1.1] font-bold tracking-tight text-charcoal sm:text-4xl lg:text-[2.75rem]"
          >
            {t("home.lifestyle.title")}
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-charcoal/80 lg:text-lg">{t("home.lifestyle.text")}</p>
          <Button size="lg" asChild className="mt-7">
            <Link href="/shop">
              {t("home.lifestyle.cta")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="relative h-[220px] sm:h-[280px] lg:absolute lg:inset-y-0 lg:right-0 lg:z-0 lg:h-auto lg:w-[64%]">
          <Image
            src="/images/home/lifestyle-loft.jpg"
            alt={t("home.lifestyle.imageAlt")}
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-cover object-[50%_58%]"
          />
          {/* Blends the photograph into the soft orange behind the text. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,var(--color-brand-soft)_0%,color-mix(in_srgb,var(--color-brand-soft),transparent_30%)_16%,transparent_46%)] lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-brand-soft to-transparent lg:hidden"
          />
        </div>
      </section>
    </Reveal>
  )
}

export { LifestyleBanner }
