"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { formatPrice } from "@/lib/currency"
import { useT } from "@/lib/i18n/provider"
import { newOrderIds, type OrderAlert } from "@/lib/services/admin-order-alerts"
import { useOrderAlertsStore } from "@/lib/store/order-alerts"

// How often to look for new orders: often while the admin is looking at the
// panel, rarely while the tab is in the background (it catches up on focus).
const VISIBLE_POLL_MS = 15_000
const HIDDEN_POLL_MS = 60_000

const TITLE_COUNT = /^\(\d+\)\s+/

// A short two-note chime, made in the browser (no sound file). Browsers may
// refuse to play until the admin has clicked something on the page; then it
// is silently skipped.
function playChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const notes = [880, 1318.5]
    notes.forEach((frequency, i) => {
      const start = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
    })
    setTimeout(() => void ctx.close().catch(() => {}), 1200)
  } catch {
    // No sound is better than a broken admin panel.
  }
}

// Watches for new orders while any admin page is open: a pop-up for each (with
// a link to it), a chime, a desktop notification when the tab is in the
// background, and the count in the tab title. Mounted once, by AdminShell.
// Renders nothing; the bell and the Orders badge read the same store.
function OrderAlertsWatcher() {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const refresh = useOrderAlertsStore((s) => s.refresh)
  const unseenCount = useOrderAlertsStore((s) => s.unseen.length)
  // The orders already known (announced, or there before the panel opened).
  // null until the first poll, which announces nothing.
  const known = useRef<Set<string> | null>(null)
  // The latest translator and router, without restarting the polling loop
  // when the language changes.
  const latest = useRef({ t, router })
  useEffect(() => {
    latest.current = { t, router }
  }, [t, router])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false

    function announce(orders: OrderAlert[]) {
      const { t, router } = latest.current
      const { soundOn } = useOrderAlertsStore.getState()
      for (const order of orders) {
        const title = t("admin.orderAlerts.newOrder", { order: order.orderNumber })
        const total = formatPrice(order.total, t)
        const description = order.customerName
          ? t("admin.orderAlerts.details", { customer: order.customerName, total })
          : t("admin.orderAlerts.detailsNoName", { total })
        const href = `/admin/orders/${order.id}`
        toast.success(title, {
          description,
          duration: 20_000,
          action: { label: t("admin.orderAlerts.view"), onClick: () => router.push(href) },
        })
        if (soundOn && document.visibilityState === "hidden" && "Notification" in window && Notification.permission === "granted") {
          try {
            const notification = new Notification(title, { body: description, tag: `order-${order.id}` })
            notification.onclick = () => {
              window.focus()
              router.push(href)
              notification.close()
            }
          } catch {
            // Some browsers (e.g. Android Chrome) only allow notifications from a service worker.
          }
        }
      }
      if (soundOn && orders.length > 0) playChime()
    }

    async function poll() {
      const list = await refresh()
      if (stopped) return
      if (list) {
        if (known.current === null) {
          known.current = new Set(list.map((order) => order.id))
        } else {
          const fresh = new Set(newOrderIds(known.current, list))
          if (fresh.size > 0) announce(list.filter((order) => fresh.has(order.id)).reverse())
          for (const order of list) known.current.add(order.id)
        }
      }
      schedule()
    }

    function schedule() {
      clearTimeout(timer)
      if (stopped) return
      timer = setTimeout(poll, document.visibilityState === "visible" ? VISIBLE_POLL_MS : HIDDEN_POLL_MS)
    }

    // Coming back to the tab: look right away rather than waiting.
    function onVisible() {
      if (document.visibilityState === "visible") {
        clearTimeout(timer)
        void poll()
      }
    }

    void poll()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      stopped = true
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [refresh])

  // "(2) Orders — …" in the tab title while orders are waiting. Re-applied on
  // navigation, since each page sets its own title.
  useEffect(() => {
    const base = document.title.replace(TITLE_COUNT, "")
    document.title = unseenCount > 0 ? `(${unseenCount}) ${base}` : base
  }, [unseenCount, pathname])

  useEffect(() => {
    return () => {
      document.title = document.title.replace(TITLE_COUNT, "")
    }
  }, [])

  return null
}

export { OrderAlertsWatcher }
