import type { Locale } from "@/lib/i18n/config"

// Gregorian dates with month names in the visitor's language (Amharic month
// names for the Gregorian calendar, e.g. "ሴፕቴ"). The Ethiopian calendar
// itself is not used.
const INTL_LOCALE: Record<Locale, string> = { en: "en-US", am: "am-ET" }

export function formatOrderDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

// The shop is in Ethiopia, so the admin's "today" and its calendar days are
// days in Addis Ababa, whatever the admin's own computer is set to.
export const STORE_TIME_ZONE = "Africa/Addis_Ababa"

/** "Thu, Oct 8, 2026": today's date in the admin's top bar. */
export function formatLongDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: STORE_TIME_ZONE,
  }).format(date)
}

/** "2026-10-08": the calendar day in Addis Ababa (for `<time dateTime>` and day buckets). */
export function storeDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: STORE_TIME_ZONE,
  }).format(date)
}

export function formatOrderDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}
