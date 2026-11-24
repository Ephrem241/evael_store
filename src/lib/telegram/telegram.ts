import { formatPrice } from "@/lib/currency"
import { createTranslator } from "@/lib/i18n/translator"
import { en } from "@/locales/en"
import { escapeHtml } from "@/lib/email/templates"
import { isUndeliverable } from "@/lib/email/dispatch"
import type { OutboxOrder } from "@/lib/email/types"

// The shop's new-order message on Telegram (migration 0031): pure pieces —
// the settings, the message, and the send loop with the bot and the queue
// passed in — so all of it is unit-tested. lib/telegram/server.ts wires in
// the real Bot API and the database.

// ---------------------------------------------------------------------------
// Settings (server-only: the bot token lets anyone post as the shop's bot).
// ---------------------------------------------------------------------------

export interface TelegramConfig {
  botToken: string
  /** A user id, a group id (negative) or a channel (@name or -100… id). */
  chatId: string
  dispatchSecret: string
}

export const TELEGRAM_ENV_VARS = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"] as const

// What @BotFather hands out: the bot's number, a colon, 35 characters.
export const TELEGRAM_TOKEN_PATTERN = /^\d{6,12}:[A-Za-z0-9_-]{30,}$/
const CHAT_ID_PATTERN = /^(-?\d{5,20}|@[A-Za-z][A-Za-z0-9_]{4,31})$/

type Env = Record<string, string | undefined>

export function readTelegramConfig(env: Env = process.env): { config: TelegramConfig | null; missing: string[] } {
  const value = (name: string) => env[name]?.trim() ?? ""
  const missing: string[] = [...TELEGRAM_ENV_VARS, "EMAIL_DISPATCH_SECRET"].filter((name) => !value(name))
  if (value("TELEGRAM_BOT_TOKEN") && !TELEGRAM_TOKEN_PATTERN.test(value("TELEGRAM_BOT_TOKEN"))) {
    missing.push("TELEGRAM_BOT_TOKEN (the token from @BotFather looks like 123456789:AA…)") // i18n-ignore: setup message
  }
  if (value("TELEGRAM_CHAT_ID") && !CHAT_ID_PATTERN.test(value("TELEGRAM_CHAT_ID"))) {
    missing.push("TELEGRAM_CHAT_ID (a number such as 123456789 or -1001234567890, or @channelname)") // i18n-ignore: setup message
  }
  if (value("EMAIL_DISPATCH_SECRET") && value("EMAIL_DISPATCH_SECRET").length < 32) {
    missing.push("EMAIL_DISPATCH_SECRET (needs 32+ characters)") // i18n-ignore: setup message
  }
  if (missing.length) return { config: null, missing }
  return {
    config: { botToken: value("TELEGRAM_BOT_TOKEN"), chatId: value("TELEGRAM_CHAT_ID"), dispatchSecret: value("EMAIL_DISPATCH_SECRET") },
    missing: [],
  }
}

// ---------------------------------------------------------------------------
// The message: Telegram's HTML formatting (bold, links), everything the
// customer typed escaped. Always in English, like the owner's alert email.
// ---------------------------------------------------------------------------

const t = createTranslator("en", en)
const money = (amount: number | string) => formatPrice(Number(amount), t)

export function renderOrderMessage(order: OutboxOrder, siteUrl: string): string {
  const a = order.delivery_address ?? {}
  const name = order.customer_name || a.full_name || "—"
  const address = [a.address, [a.woreda, a.sub_city].filter(Boolean).join(", "), a.city].filter((part) => part && String(part).trim())
  const items = order.items.map((item) =>
    t("email.telegram.line", {
      quantity: item.quantity,
      name: escapeHtml(item.size ? `${item.name} (${item.size})` : item.name),
      total: money(item.total),
    })
  )

  return [
    `🛒 <b>${escapeHtml(t("email.telegram.heading", { number: order.order_number }))}</b>`,
    "",
    `<b>${t("email.telegram.customer")}:</b> ${escapeHtml(name)}`,
    ...(a.phone ? [`<b>${t("email.telegram.phone")}:</b> ${escapeHtml(a.phone)}`] : []),
    ...(address.length ? [`<b>${t("email.telegram.address")}:</b> ${escapeHtml(address.join(", "))}`] : []),
    "",
    `<b>${t("email.telegram.items")}:</b>`,
    ...items.map((line) => `• ${line}`),
    "",
    `<b>${escapeHtml(t("email.telegram.total", { total: money(order.total) }))}</b> · ${t("email.cod")}`,
    escapeHtml(t("email.telegram.breakdown", { subtotal: money(order.subtotal), delivery: money(order.delivery_fee) })),
    "",
    `<a href="${escapeHtml(`${siteUrl}/admin/orders/${order.id}`)}">${t("email.telegram.open")}</a>`,
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Sending what is queued.
// ---------------------------------------------------------------------------

export interface TelegramRow {
  id: string
  order: OutboxOrder | null
}

export interface TelegramQueue {
  claim(limit: number): Promise<TelegramRow[]>
  complete(id: string, error: string | null): Promise<void>
}

export interface TelegramBot {
  send(chatId: string, html: string): Promise<void>
}

/** The bot is refused outright (wrong token, bot removed from the chat): stop, retry later. */
export class TelegramSetupError extends Error {}

export interface TelegramDispatchResult {
  sent: number
  failed: number
  skipped: number
  blocked?: string
}

export async function dispatchTelegram({
  bot,
  queue,
  chatId,
  siteUrl,
  batchSize = 10,
  maxBatches = 3,
}: {
  bot: TelegramBot
  queue: TelegramQueue
  chatId: string
  siteUrl: string
  batchSize?: number
  maxBatches?: number
}): Promise<TelegramDispatchResult> {
  const result: TelegramDispatchResult = { sent: 0, failed: 0, skipped: 0 }

  for (let batch = 0; batch < maxBatches; batch++) {
    const rows = await queue.claim(batchSize)
    for (const row of rows) {
      // The order is gone, or it is test traffic (the e2e suite's
      // e2e-…@example.com shoppers): settle it without a message.
      if (!row.order || isUndeliverable(row.order.customer_email)) {
        await queue.complete(row.id, null)
        result.skipped++
        continue
      }
      try {
        await bot.send(chatId, renderOrderMessage(row.order, siteUrl))
        await queue.complete(row.id, null)
        result.sent++
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        // Counted as an attempt either way; a setup problem also ends this run.
        await queue.complete(row.id, message || "send failed") // i18n-ignore: stored for the developer
        result.failed++
        if (error instanceof TelegramSetupError) {
          result.blocked = message
          return result
        }
      }
    }
    if (rows.length < batchSize) break
  }
  return result
}

// ---------------------------------------------------------------------------
// The Bot API (https://core.telegram.org/bots/api#sendmessage).
// ---------------------------------------------------------------------------

export function createTelegramBot(token: string, fetchImpl: typeof fetch = fetch): TelegramBot {
  return {
    async send(chatId, html) {
      const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
        signal: AbortSignal.timeout(15_000),
      })
      if (response.ok) return
      let detail = ""
      try {
        const body = (await response.json()) as { description?: unknown }
        if (typeof body.description === "string") detail = body.description
      } catch {
        // not JSON
      }
      // Never include the token (it is in the URL, not here).
      const failure = `Telegram ${response.status}${detail ? ` ${detail}` : ""}` // i18n-ignore: stored for the developer
      if (response.status === 401 || response.status === 403 || /chat not found/i.test(detail)) throw new TelegramSetupError(failure)
      throw new Error(failure)
    },
  }
}
