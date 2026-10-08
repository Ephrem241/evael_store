import Image from "next/image"
import { BadgeCheck, Headset, Mail, ShieldCheck, Truck } from "lucide-react"

import { BRAND_NAME } from "@/lib/brand"
import { getT } from "@/lib/i18n/server"
import type { MessageKey } from "@/lib/i18n/translator"
import { Reveal } from "@/components/motion/reveal"
import { Newsletter } from "@/components/home/newsletter"
import { SectionHeading } from "@/components/home/section-heading"

// Four plain points — no ratings, counts or guarantees the store can't back up.
const POINTS: { icon: typeof Truck; title: MessageKey; text: MessageKey }[] = [
  { icon: ShieldCheck, title: "home.why.secureTitle", text: "home.why.secureText" },
  { icon: Truck, title: "home.why.deliveryTitle", text: "home.why.deliveryText" },
  { icon: BadgeCheck, title: "home.why.qualityTitle", text: "home.why.qualityText" },
  { icon: Headset, title: "home.why.supportTitle", text: "home.why.supportText" },
]

// The homepage's closing pair. Left (two thirds on desktop): "Why Shop With
// Evael?" and four bordered cards. Right: the newsletter card on the
// footer's near-black — a gold mail icon, the heading and its line, the email
// field joined to Subscribe, and a photograph on its right edge with a
// handwritten note over it (decorative, desktop only). White on the
// near-black is 17.9:1; the form sits on its own white field.
async function WhyEvael() {
  const t = await getT()

  return (
    <Reveal>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end lg:gap-8">
        <section aria-labelledby="why-heading" className="space-y-4 lg:space-y-5">
          <SectionHeading id="why-heading" title={t("home.why.title", { brand: BRAND_NAME.split(" ")[0] })} />
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-3 rounded-card border border-border bg-surface p-4 max-sm:flex-col max-sm:gap-2">
                <point.icon aria-hidden className="size-7 shrink-0 text-brand" strokeWidth={1.5} />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[13px] font-semibold text-charcoal">{t(point.title)}</p>
                  <p className="text-xs leading-snug text-muted-text">{t(point.text)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="newsletter-card-heading"
          className="relative isolate overflow-hidden rounded-hero bg-footer px-5 py-5 text-white"
        >
          <div className="absolute inset-y-0 right-0 -z-10 w-[40%]">
            <Image
              src="/images/home/newsletter-shopper.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 160px, 40vw"
              className="object-cover object-[70%_30%]"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-r from-footer to-transparent to-60%" />
          </div>
          <p
            aria-hidden
            className="pointer-events-none absolute top-3 right-3 hidden rotate-[-8deg] font-script text-xl leading-tight font-semibold text-gold lg:block"
          >
            {t("home.newsletter.flourish")}
          </p>
          <div className="max-w-[64%] space-y-1.5">
            <h2 id="newsletter-card-heading" className="flex items-center gap-2 text-base font-bold">
              <Mail aria-hidden className="size-5 shrink-0 text-gold" />
              {t("home.newsletter.cardTitle")}
            </h2>
            <p className="text-xs text-white/75">{t("home.newsletter.cardText")}</p>
          </div>
          <div className="mt-4">
            <Newsletter variant="joined" />
          </div>
        </section>
      </div>
    </Reveal>
  )
}

export { WhyEvael }
