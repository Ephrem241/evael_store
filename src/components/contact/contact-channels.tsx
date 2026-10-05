import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import { telegramLink, telLink, whatsappLink } from "@/lib/contact-links"
import type { StoreContact } from "@/lib/services/store-info"
import { ChannelLogo, type ContactChannelKey } from "@/components/contact/channel-logos"

interface Channel {
  key: ContactChannelKey
  href: string
  value: string
  external: boolean
}

// The links for the channels the shop has set (and that make sense as links).
function channelsOf(contact: Pick<StoreContact, "telegram" | "whatsapp" | "phone">): Channel[] {
  const channels: (Channel | null)[] = [
    contact.telegram && telegramLink(contact.telegram)
      ? { key: "telegram", href: telegramLink(contact.telegram)!, value: contact.telegram, external: true }
      : null,
    contact.whatsapp && whatsappLink(contact.whatsapp)
      ? { key: "whatsapp", href: whatsappLink(contact.whatsapp)!, value: contact.whatsapp, external: true }
      : null,
    contact.phone && telLink(contact.phone)
      ? { key: "call", href: telLink(contact.phone)!, value: contact.phone, external: false }
      : null,
  ]
  return channels.filter((c): c is Channel => c !== null)
}

const styles = {
  // On the white contact card: the logo and the channel's name.
  light:
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white py-1.5 pr-4 pl-1.5 text-sm font-medium text-charcoal transition-colors outline-none hover:border-forest hover:text-forest focus-visible:ring-3 focus-visible:ring-ring/50",
  // In the dark footer: the logo alone.
  dark: "inline-flex size-11 items-center justify-center rounded-full transition-transform outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-gold/60",
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
      {channels.map(({ key, href, value, external }) => {
        const name = t(`info.contact.${key}`)
        return (
          <li key={key}>
            <a
              href={href}
              className={styles[variant]}
              aria-label={t("info.contact.channelLabel", { channel: name, value })}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <ChannelLogo channel={key} className={variant === "dark" ? "size-10" : "size-8"} />
              {variant === "light" && <span>{name}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export { ContactChannels }
