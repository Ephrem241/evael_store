import { RotateCcw, ShieldCheck, Truck } from "lucide-react"

import { BRAND_NAME } from "@/lib/brand"
import { formatPrice } from "@/lib/currency"
import { getT } from "@/lib/i18n/server"
import { getFreeDeliveryThreshold } from "@/lib/services/store-settings"
import { Container } from "@/components/layout/container"

// The thin orange bar above the header. The free-delivery line is shown ONLY
// when a free-delivery threshold is actually configured — it is read from the
// same `store_settings` row the database applies when it prices an order, so
// this bar can never promise something checkout doesn't do.
//
// Phones show a single line (the delivery offer, or the welcome line if there
// is no offer); from `lg` up it is the three-part layout, the offer centred.
// White text sits on the strong orange (4.5:1), not the bright one (3.2:1).
async function AnnouncementBar() {
  const [t, threshold] = await Promise.all([getT(), getFreeDeliveryThreshold()])
  const freeDelivery =
    threshold != null ? t("nav.announcement.freeDelivery", { amount: formatPrice(threshold, t) }) : null
  const welcome = t("nav.announcement.welcome", { brand: BRAND_NAME })

  return (
    // A named region, so its text is inside a landmark like the rest of the page.
    <section aria-label={t("nav.announcementsLabel")} className="bg-brand-strong text-[13px] leading-none text-white">
      <Container className="flex h-9 items-center justify-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <p className="flex items-center gap-2 truncate font-medium lg:hidden">
          {freeDelivery && <Truck aria-hidden className="size-4 shrink-0" />}
          <span className="truncate">{freeDelivery ?? welcome}</span>
        </p>

        <p className="hidden truncate lg:block">{welcome}</p>
        <p className="hidden items-center justify-center gap-2 font-medium lg:flex">
          {freeDelivery && (
            <>
              <Truck aria-hidden className="size-4 shrink-0" />
              {freeDelivery}
            </>
          )}
        </p>
        <p className="hidden items-center justify-end gap-4 lg:flex">
          <span className="flex items-center gap-1.5">
            <RotateCcw aria-hidden className="size-3.5" />
            {t("nav.announcement.easyReturns")}
          </span>
          <span aria-hidden className="h-3 w-px bg-white/40" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck aria-hidden className="size-3.5" />
            {t("nav.announcement.securePayments")}
          </span>
        </p>
      </Container>
    </section>
  )
}

export { AnnouncementBar }
