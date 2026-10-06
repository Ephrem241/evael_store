import type { Metadata } from "next"
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { pageMetadata } from "@/lib/seo/metadata"
import { getStoreContact } from "@/lib/services/store-info"
import { InfoLink, InfoPage, InfoSection, linkClass } from "@/components/info/info-page"
import { ContactForm } from "@/components/contact/contact-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return pageMetadata({
    locale: t.locale,
    path: "/contact",
    title: t("info.contact.title"),
    description: t("info.contact.subtitle"),
  })
}

// The shape of an order number (see place_order): ETM-20260924-A1B2.
const ORDER_NUMBER_EXAMPLE = "ETM-YYYYMMDD-XXXX"

// Only a plausible address/number becomes a mailto:/tel: link; anything else the
// shop typed in is shown as plain text.
const EMAIL = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/
const PHONE = /^\+?[\d\s\-()]{6,}$/

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon
  label: string
  value: string
  href?: string
}) {
  // A <dl> group may only hold the <dt> and its <dd>, so the round icon lives
  // inside the <dt> and is pinned into the row's left padding.
  return (
    <div className="relative min-h-11 ps-15">
      <dt className="text-sm text-muted-text">
        <span className="absolute start-0 top-0 flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon aria-hidden className="size-5" strokeWidth={1.6} />
        </span>
        {label}
      </dt>
      <dd className="font-medium break-words text-charcoal">
        {href ? (
          <a href={href} className={linkClass}>
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

// Shows only the contact details the shop has actually set (store_settings) —
// never a placeholder address or phone number — and the message form, which
// emails the shop (it works whether or not those details are set).
export default async function ContactPage() {
  const [t, contact] = await Promise.all([getT(), getStoreContact()])
  const hasDetails = Boolean(contact.email || contact.phone || contact.address || contact.hours)

  return (
    <InfoPage title={t("info.contact.title")} description={t("info.contact.subtitle")}>
      {hasDetails ? (
        <dl className="space-y-6 rounded-card border border-border bg-white p-5 sm:p-7">
          {contact.email && (
            <ContactRow
              icon={Mail}
              label={t("info.contact.email")}
              value={contact.email}
              href={EMAIL.test(contact.email) ? `mailto:${contact.email}` : undefined}
            />
          )}
          {contact.phone && (
            <ContactRow
              icon={Phone}
              label={t("info.contact.phone")}
              value={contact.phone}
              href={PHONE.test(contact.phone) ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : undefined}
            />
          )}
          {contact.address && <ContactRow icon={MapPin} label={t("info.contact.address")} value={contact.address} />}
          {contact.hours && <ContactRow icon={Clock} label={t("info.contact.hours")} value={contact.hours} />}
        </dl>
      ) : (
        <div className="space-y-4 rounded-card bg-brand-soft/70 p-5 sm:p-7">
          <p className="leading-relaxed text-charcoal/80">{t("info.contact.notSet")}</p>
          <InfoLink href="/faq">{t("info.common.faqLink")}</InfoLink>
        </div>
      )}

      <ContactForm />

      <InfoSection title={t("info.contact.orderHelpTitle")}>
        <p>{t("info.contact.orderHelpText", { example: ORDER_NUMBER_EXAMPLE })}</p>
        <InfoLink href="/account/orders">{t("info.common.ordersLink")}</InfoLink>
      </InfoSection>

      {hasDetails && <InfoLink href="/faq">{t("info.common.faqLink")}</InfoLink>}
    </InfoPage>
  )
}
