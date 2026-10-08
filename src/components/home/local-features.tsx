import Image from "next/image"
import { Banknote, Headset, Languages, MousePointerClick, Truck } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import type { MessageKey } from "@/lib/i18n/translator"
import { Reveal } from "@/components/motion/reveal"

// What the shop really offers today, each line checkable: delivery to every
// region (delivery_fees covers the whole country), cash on delivery (the only
// payment checkout takes), the whole shop in Amharic and English, the shop's
// own contact channels, and a simple checkout.
const FEATURES: { icon: typeof Truck; title: MessageKey; text: MessageKey }[] = [
  { icon: Truck, title: "home.local.deliveryTitle", text: "home.local.deliveryText" },
  { icon: Banknote, title: "home.local.codTitle", text: "home.local.codText" },
  { icon: Languages, title: "home.local.languageTitle", text: "home.local.languageText" },
  { icon: Headset, title: "home.local.supportTitle", text: "home.local.supportText" },
  { icon: MousePointerClick, title: "home.local.easyTitle", text: "home.local.easyText" },
]

// "Built for Ethiopian Shoppers": a white card. Desktop, left to right: the
// Addis Ababa skyline fading into the card, the heading and its line, then
// the five features in a row. Phones: the skyline on top, the heading, and
// the features in two columns.
async function LocalFeatures() {
  const t = await getT()

  return (
    <Reveal>
      <section
        aria-labelledby="local-heading"
        className="overflow-hidden rounded-card border border-border bg-surface shadow-soft lg:grid lg:grid-cols-[12rem_minmax(0,16rem)_1fr] lg:items-center lg:gap-x-6"
      >
        <div className="relative h-32 lg:h-full lg:min-h-36 lg:self-stretch">
          <Image
            src="/images/home/addis-skyline.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 192px, 100vw"
            className="object-cover object-[50%_60%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface to-transparent to-60% lg:bg-linear-to-l lg:to-70%"
          />
        </div>
        <div className="space-y-1.5 px-5 lg:px-0 lg:py-6">
          <h2 id="local-heading" className="type-section text-charcoal">
            {t("home.local.title")}
          </h2>
          <p className="text-sm text-muted-text">{t("home.local.text")}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 px-5 pt-5 pb-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-4 lg:py-6 lg:pr-6 lg:pl-0">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex items-start gap-2.5">
              <feature.icon aria-hidden className="mt-0.5 size-6 shrink-0 text-brand" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-[13px] leading-snug font-semibold text-charcoal">{t(feature.title)}</p>
                <p className="text-xs text-muted-text">{t(feature.text)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  )
}

export { LocalFeatures }
