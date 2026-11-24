import { describe, expect, it } from "vitest"

import {
  createTelegramBot,
  dispatchTelegram,
  readTelegramConfig,
  renderOrderMessage,
  TelegramSetupError,
  type TelegramBot,
  type TelegramRow,
} from "@/lib/telegram/telegram"
import type { OutboxOrder } from "@/lib/email/types"

const TOKEN = "123456789:AAH4kZ1t9x8y7w6v5u4t3s2r1q0pXYZabcd"
const SECRET = "x".repeat(32)

const order: OutboxOrder = {
  id: "11111111-2222-3333-4444-555555555555",
  order_number: "EVS-20261124-001",
  status: "pending",
  payment_method: "cod",
  subtotal: 7150,
  delivery_fee: 300,
  discount: 0,
  total: 7450,
  delivery_address: { full_name: "Fitsum Ayele", phone: "+251911223344", city: "Addis Ababa", sub_city: "Bole", woreda: "03", address: "Near <Edna> Mall" },
  created_at: "2026-11-24T09:00:00Z",
  customer_name: "Fitsum Ayele",
  customer_email: "fitsum@mail.et",
  items: [
    { name: "Gold Water Jug", quantity: 2, unit_price: 1200, total: 2400 },
    { name: "T-shirt", size: "M", quantity: 1, unit_price: 4750, total: 4750 },
  ],
}

describe("readTelegramConfig", () => {
  it("needs the bot token, the chat and the dispatch secret", () => {
    expect(readTelegramConfig({}).config).toBeNull()
    expect(readTelegramConfig({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: "-1001234567890", EMAIL_DISPATCH_SECRET: SECRET }).config).toEqual({
      botToken: TOKEN,
      chatId: "-1001234567890",
      dispatchSecret: SECRET,
    })
  })

  it("names what is wrong with a mistyped token or chat", () => {
    const { config, missing } = readTelegramConfig({ TELEGRAM_BOT_TOKEN: "abc", TELEGRAM_CHAT_ID: "my group", EMAIL_DISPATCH_SECRET: SECRET })
    expect(config).toBeNull()
    expect(missing.join(" ")).toContain("TELEGRAM_BOT_TOKEN")
    expect(missing.join(" ")).toContain("TELEGRAM_CHAT_ID")
  })

  it("accepts a channel name as the chat", () => {
    expect(readTelegramConfig({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: "@evaelorders", EMAIL_DISPATCH_SECRET: SECRET }).config?.chatId).toBe("@evaelorders")
  })
})

describe("renderOrderMessage", () => {
  const text = renderOrderMessage(order, "https://evaelstore.com")

  it("gives the order, the customer, the phone, the address, each item and the total", () => {
    expect(text).toContain("New order EVS-20261124-001")
    expect(text).toContain("Fitsum Ayele")
    expect(text).toContain("+251911223344")
    expect(text).toContain("03, Bole, Addis Ababa")
    expect(text).toContain("2 × Gold Water Jug: 2,400 ETB")
    expect(text).toContain("1 × T-shirt (M): 4,750 ETB")
    expect(text).toContain("Total: 7,450 ETB")
    expect(text).toContain("Items 7,150 ETB + delivery 300 ETB")
    expect(text).toContain('href="https://evaelstore.com/admin/orders/11111111-2222-3333-4444-555555555555"')
  })

  it("escapes what the customer typed, so it can't break Telegram's formatting", () => {
    expect(text).toContain("Near &lt;Edna&gt; Mall")
    expect(text).not.toContain("<Edna>")
  })
})

function fakeQueue(rows: TelegramRow[]) {
  const settled: [string, string | null][] = []
  let claimed = false
  return {
    settled,
    queue: {
      async claim() {
        if (claimed) return []
        claimed = true
        return rows
      },
      async complete(id: string, error: string | null) {
        settled.push([id, error])
      },
    },
  }
}

describe("dispatchTelegram", () => {
  it("sends each queued order and settles it", async () => {
    const sent: string[] = []
    const bot: TelegramBot = { send: async (chat, html) => void sent.push(`${chat}|${html.slice(0, 40)}`) }
    const f = fakeQueue([{ id: "a", order }])
    const result = await dispatchTelegram({ bot, queue: f.queue, chatId: "42", siteUrl: "https://x.et" })
    expect(result).toEqual({ sent: 1, failed: 0, skipped: 0 })
    expect(sent[0].startsWith("42|")).toBe(true)
    expect(f.settled).toEqual([["a", null]])
  })

  it("settles test orders and deleted orders without a message", async () => {
    const bot: TelegramBot = { send: async () => { throw new Error("must not send") } }
    const f = fakeQueue([
      { id: "a", order: { ...order, customer_email: "e2e-shopper@example.com" } },
      { id: "b", order: null },
    ])
    const result = await dispatchTelegram({ bot, queue: f.queue, chatId: "42", siteUrl: "https://x.et" })
    expect(result).toEqual({ sent: 0, failed: 0, skipped: 2 })
    expect(f.settled).toEqual([["a", null], ["b", null]])
  })

  it("records a failed send for a retry, and stops at a setup problem", async () => {
    const bot: TelegramBot = { send: async () => { throw new TelegramSetupError("Telegram 401 Unauthorized") } }
    const f = fakeQueue([{ id: "a", order }, { id: "b", order }])
    const result = await dispatchTelegram({ bot, queue: f.queue, chatId: "42", siteUrl: "https://x.et" })
    expect(result).toEqual({ sent: 0, failed: 1, skipped: 0, blocked: "Telegram 401 Unauthorized" })
    expect(f.settled).toEqual([["a", "Telegram 401 Unauthorized"]])
  })
})

describe("createTelegramBot", () => {
  it("posts HTML to sendMessage and turns a refusal into a setup error, without the token", async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = []
    const ok = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) })
      return new Response("{}", { status: 200 })
    }) as unknown as typeof fetch
    await createTelegramBot(TOKEN, ok).send("42", "<b>hi</b>")
    expect(calls[0].url).toBe(`https://api.telegram.org/bot${TOKEN}/sendMessage`)
    expect(calls[0].body).toMatchObject({ chat_id: "42", text: "<b>hi</b>", parse_mode: "HTML" })

    const refused = (async () => new Response(JSON.stringify({ description: "Forbidden: bot was kicked" }), { status: 403 })) as unknown as typeof fetch
    let error: unknown
    try {
      await createTelegramBot(TOKEN, refused).send("42", "x")
    } catch (e) {
      error = e
    }
    expect(error instanceof TelegramSetupError).toBe(true)
    expect(String((error as Error).message)).toBe("Telegram 403 Forbidden: bot was kicked")
  })
})
