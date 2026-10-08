import { Truck } from "lucide-react"

import { formatPrice } from "@/lib/currency"
import { getT } from "@/lib/i18n/server"
import { getFreeDeliveryThreshold } from "@/lib/services/store-settings"
import { Container } from "@/components/layout/container"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

// The thin burgundy bar above the header, on tablets and desktops (phones
// start with the burgundy header instead). Left: the free-delivery offer and a
// line about delivery; right: the language switch.
//
// The free-delivery line is shown ONLY when a threshold is actually
// configured — it is read from the same `store_settings` row the database
// applies when it prices an order, so this bar can never promise something
// checkout doesn't do. The delivery line names no delivery times: none are
// configured. White on the dark burgundy is 12.3:1.
async function AnnouncementBar() {
  const [t, threshold] = await Promise.all([getT(), getFreeDeliveryThreshold()])
  const freeDelivery =
    threshold != null ? t("nav.announcement.freeDelivery", { amount: formatPrice(threshold, t) }) : null

  return (
    // A named region, so its text is inside a landmark like the rest of the page.
    <section aria-label={t("nav.announcementsLabel")} className="hidden bg-brand-deep text-xs text-white sm:block">
      <Container className="flex h-7 items-center justify-between gap-6">
        <p className="flex min-w-0 items-center gap-2.5">
          <Truck aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
          {freeDelivery && (
            <>
              <span className="shrink-0 font-medium">{freeDelivery}</span>
              <span aria-hidden className="h-3 w-px shrink-0 bg-white/40" />
            </>
          )}
          <span className="truncate text-white/90">{t("nav.announcement.delivery")}</span>
        </p>
        <LanguageSwitcher tone="bar" />
      </Container>
    </section>
  )
}

export { AnnouncementBar }
