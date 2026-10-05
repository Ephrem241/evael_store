import { MessageCircle, Phone, Send, type LucideIcon } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import { telegramLink, telLink, whatsappLink } from "@/lib/contact-links"
import type { StoreContact } from "@/lib/services/store-info"

interface Channel {
  key: "telegram" | "whatsapp" | "call"
  icon: LucideIcon
  href: string
  value: string
  external: boolean
}

// The links for the channels the shop has set (and that make sense as links).
function channelsOf(contact: Pick<StoreContact, "telegram" | "whatsapp" | "phone">): Channel[] {
  const channels: (Channel | null)[] = [
    contact.telegram && telegramLink(contact.telegram)
      ? { key: "telegram", icon: Send, href: telegramLink(contact.telegram)!, value: contact.telegram, external: true }
      : null,
    contact.whatsapp && whatsappLink(contact.whatsapp)
      ? { key: "whatsapp", icon: MessageCircle, href: whatsappLink(contact.whatsapp)!, value: contact.whatsapp, external: true }
      : null,
    contact.phone && telLink(contact.phone)
      ? { key: "call", icon: Phone, href: telLink(contact.phone)!, value: contact.phone, external: false }
      : null,
  ]
  return channels.filter((c): c is Channel => c !== null)
}

const styles = {
  // On the white contact card: big labelled buttons.
  light:
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-charcoal transition-colors outline-none hover:border-forest hover:text-forest focus-visible:ring-3 focus-visible:ring-ring/50",
  // In the dark footer: round icon buttons.
  dark: "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors outline-none hover:bg-gold hover:text-forest-dark focus-visible:ring-3 focus-visible:ring-gold/50",
}

// Telegram, WhatsApp and Call buttons. Shows only the channels that are set;
// renders nothing when none are.
async function ContactChannels({
  contact,
  variant = "light",
  className,
}: {
  contact: Pick<StoreContact, "telegram" | "whatsapp" | "phone">
  variant?: "light" | "dark"
  className?: string
}) {
  const channels = channelsOf(contact)
  if (channels.length === 0) return null
  const t = await getT()

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {channels.map(({ key, icon: Icon, href, value, external }) => {
        const name = t(`info.contact.${key}`)
        return (
          <li key={key}>
            <a
              href={href}
              className={styles[variant]}
              aria-label={t("info.contact.channelLabel", { channel: name, value })}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Icon aria-hidden className={variant === "dark" ? "size-5" : "size-4"} strokeWidth={1.8} />
              {variant === "light" && <span>{name}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export { ContactChannels }
