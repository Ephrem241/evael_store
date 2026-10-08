"use client"

import Link from "next/link"
import { Bell, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"

import { useT } from "@/lib/i18n/provider"
import { useOrderAlertsStore } from "@/lib/store/order-alerts"

const buttonClass =
  "relative flex size-10 items-center justify-center rounded-lg text-charcoal/80 outline-none transition-colors hover:bg-card hover:text-charcoal focus-visible:ring-2 focus-visible:ring-ring max-lg:size-11"

// The admin top bar's bell (new orders not opened yet, linking to the orders;
// the count sits on it in a red badge) and the switch for the new-order sound
// and desktop alerts.
function OrderAlertsBell() {
  const t = useT()
  const count = useOrderAlertsStore((s) => s.unseen.length)
  const soundOn = useOrderAlertsStore((s) => s.soundOn)
  const setSoundOn = useOrderAlertsStore((s) => s.setSoundOn)

  function toggleSound() {
    const next = !soundOn
    setSoundOn(next)
    toast(next ? t("admin.orderAlerts.soundEnabled") : t("admin.orderAlerts.soundDisabled"))
    // Asked from a click, as browsers require; a refusal only means no
    // desktop pop-ups (the in-page alert and sound still work).
    if (next && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission().catch(() => {})
    }
  }

  return (
    <div className="flex items-center">
      <Link
        href="/admin/orders"
        aria-label={count > 0 ? t.plural("admin.orderAlerts.bellLabel", count) : t("admin.orderAlerts.bellLabelNone")}
        className={buttonClass}
      >
        <Bell aria-hidden strokeWidth={1.75} className="size-5" />
        {count > 0 && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-sale px-1 text-[11px] leading-4.5 font-bold text-white ring-2 ring-admin-bg"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? t("admin.orderAlerts.soundOn") : t("admin.orderAlerts.soundOff")}
        title={soundOn ? t("admin.orderAlerts.soundOn") : t("admin.orderAlerts.soundOff")}
        className={buttonClass}
      >
        {soundOn ? (
          <Volume2 aria-hidden strokeWidth={1.75} className="size-5" />
        ) : (
          <VolumeX aria-hidden strokeWidth={1.75} className="size-5" />
        )}
      </button>
    </div>
  )
}

export { OrderAlertsBell }
