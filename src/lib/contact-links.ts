// Turns the contact details the shop typed in (store_settings) into links.
// Each helper returns null for a value that isn't plausible, so a typo shows
// as nothing (or plain text) rather than a broken link.

// A phone number as people write it: optional +, digits, spaces, dashes, brackets.
export const PHONE_PATTERN = /^\+?[\d\s\-()]{6,}$/
// A Telegram username (5–32 letters, digits or underscores), with or without @.
const TELEGRAM_USERNAME = /^@?([a-zA-Z][a-zA-Z0-9_]{4,31})$/

function digits(value: string): string {
  return value.replace(/\D/g, "")
}

function isPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim()) && digits(value).length >= 6
}

/** `tel:+251949888889` */
export function telLink(value: string | null | undefined): string | null {
  if (!value || !isPhone(value)) return null
  return `tel:${value.trim().replace(/[^\d+]/g, "")}`
}

/**
 * `whatsapp://send?phone=251949888889` — opens the WhatsApp chat with that
 * number straight away, like `tel:` opens the dialler (no web landing page).
 * WhatsApp wants the number without + or spaces.
 */
export function whatsappLink(value: string | null | undefined): string | null {
  if (!value || !isPhone(value)) return null
  return `whatsapp://send?phone=${digits(value)}`
}

/**
 * A phone number opens the Telegram chat directly (`tg://resolve?phone=251949888889`);
 * a username opens `https://t.me/name`.
 */
export function telegramLink(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (isPhone(trimmed)) return `tg://resolve?phone=${digits(trimmed)}`
  const username = TELEGRAM_USERNAME.exec(trimmed)
  return username ? `https://t.me/${username[1]}` : null
}
