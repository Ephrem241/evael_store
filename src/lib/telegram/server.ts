import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { SITE_URL } from "@/lib/seo/site"
import {
  createTelegramBot,
  dispatchTelegram,
  readTelegramConfig,
  type TelegramDispatchResult,
  type TelegramQueue,
  type TelegramRow,
} from "@/lib/telegram/telegram"

// The real queue (the database, with the public key: the dispatch secret is
// what lets this server read it, as for the email outbox) and the real bot.
// Used only by the /api/email/dispatch route.

function createDatabaseQueue(secret: string): TelegramQueue {
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return {
    async claim(limit) {
      const { data, error } = await supabase.rpc("claim_telegram_outbox", { p_secret: secret, p_limit: limit })
      if (error) throw new Error(`claim_telegram_outbox: ${error.message}`) // i18n-ignore: developer-facing
      return (data ?? []) as TelegramRow[]
    },
    async complete(id, sendError) {
      const { error } = await supabase.rpc("complete_telegram_outbox", { p_secret: secret, p_id: id, p_error: sendError })
      if (error) throw new Error(`complete_telegram_outbox: ${error.message}`) // i18n-ignore: developer-facing
    },
  }
}

export function telegramConfigured(): boolean {
  return readTelegramConfig().config !== null
}

// null when Telegram isn't configured (messages stay queued).
export async function dispatchQueuedTelegram(): Promise<TelegramDispatchResult | null> {
  const { config } = readTelegramConfig()
  if (!config) return null
  return dispatchTelegram({
    bot: createTelegramBot(config.botToken),
    queue: createDatabaseQueue(config.dispatchSecret),
    chatId: config.chatId,
    siteUrl: SITE_URL,
  })
}
