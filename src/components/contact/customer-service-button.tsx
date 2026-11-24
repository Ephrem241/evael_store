"use client"

import { usePathname } from "next/navigation"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { ChannelLogo } from "@/components/contact/channel-logos"

// The floating "Customer service" button, bottom right on every shop page: it
// opens the shop's Telegram chat (store_settings.contact_telegram, @EVAELSTORES
// since 0030). The root layout renders it only when that is set, and passes
// the link already checked by telegramLink.
//
// It sits just above the "Ask Evael" assistant button when that is shown
// (`stacked`), and otherwise in the assistant's place: on phones and tablets
// above the bar pinned to the bottom, on desktop in the corner. A round logo
// on phones; with its name on desktop. Off the checkout, like the assistant.
function CustomerServiceButton({ href, stacked }: { href: string; stacked: boolean }) {
  const t = useT()
  const pathname = usePathname()
  if (pathname === "/checkout") return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t("nav.customerService")}: ${t("nav.customerServiceHint")}`}
      className={cn(
        "fixed right-4 z-40 flex size-14 items-center justify-center gap-2 rounded-full bg-surface text-charcoal shadow-lift ring-1 ring-border transition-colors outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] lg:right-6 lg:h-12 lg:w-auto lg:pr-5 lg:pl-1.5",
        stacked ? "bottom-[calc(9.5rem+env(safe-area-inset-bottom))] lg:bottom-21" : "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-6"
      )}
    >
      <ChannelLogo channel="telegram" className="size-10 lg:size-9" />
      <span className="sr-only text-sm font-semibold lg:not-sr-only">{t("nav.customerService")}</span>
    </a>
  )
}

export { CustomerServiceButton }
