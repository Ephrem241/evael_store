import { NextResponse, type NextRequest } from "next/server"

import { buildAssistantContext } from "@/lib/ai/assistant-context"
import { parseHistory } from "@/lib/ai/assistant-history"
import { extractProductSlugs } from "@/lib/ai/assistant-prompt"
import { isAssistantConfigured } from "@/lib/ai/config"
import { ASSISTANT_LIMITS } from "@/lib/ai/limits"
import { streamReply } from "@/lib/ai/gemini"
import { encodeEvent } from "@/lib/ai/ndjson"
import { ASSISTANT_RATE_WINDOWS, createRateLimiter } from "@/lib/ai/rate-limit"
import type { AssistantProduct, AssistantStreamEvent } from "@/lib/ai/types"
import type { Locale } from "@/lib/i18n/config"
import { nameOf } from "@/lib/i18n/content"
import { getLocale } from "@/lib/i18n/server"
import { isOnSale, type ProductWithCategory } from "@/lib/services/catalog"

// The shopping assistant (components/assistant): the browser sends the
// conversation so far, Gemini writes the next reply, and it streams back as
// NDJSON (lib/ai/ndjson.ts) — the text as it is written, then the products the
// reply linked to, checked against the live catalog (a link the model made up
// gets no card, and the panel shows it as plain text).
//
// Every question costs the shop a Gemini call, so before one is made: the
// assistant must be configured, the request must come from this site's own
// pages (another site can't spend the key from its visitors' browsers), one
// visitor may only ask so often, and the conversation must pass
// parseHistory. Nothing is stored; errors are logged without the shopper's
// words.
//
// A Route Handler rather than a Server Function: it streams its answer, and
// Server Functions return one value.

// Gemini usually answers in a few seconds, but now and then takes far longer.
export const maxDuration = 60

// Lives as long as this server process (see rate-limit.ts for what that means).
const limiter = createRateLimiter(ASSISTANT_RATE_WINDOWS)

export async function POST(request: NextRequest) {
  if (!isAssistantConfigured()) return failure(503, "unconfigured")
  if (!isSameOrigin(request)) return failure(403, "forbidden")

  const rate = limiter.hit(clientIp(request))
  if (!rate.allowed) {
    return NextResponse.json(
      { code: "too_many" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds), "Cache-Control": "no-store" } }
    )
  }

  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > ASSISTANT_LIMITS.maxBodyBytes) return failure(413, "too_large")
  const raw = await request.text()
  if (Buffer.byteLength(raw) > ASSISTANT_LIMITS.maxBodyBytes) return failure(413, "too_large")
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return failure(400, "bad_request")
  }
  const history = parseHistory(body)
  if (!history) return failure(400, "bad_request")

  const locale = await getLocale()
  let context: Awaited<ReturnType<typeof buildAssistantContext>>
  try {
    context = await buildAssistantContext(locale)
  } catch (error) {
    console.error("assistant: could not load the catalog:", messageOf(error)) // i18n-ignore: server log
    return failure(502, "upstream")
  }

  // Wait for the first words before answering, so a call that fails outright
  // (bad key, quota, model unavailable) is a clean error status, not an empty
  // stream.
  const reply = streamReply({ system: context.system, history, signal: request.signal })
  let first: IteratorResult<string>
  try {
    first = await reply.next()
  } catch (error) {
    console.error("assistant: Gemini call failed:", messageOf(error)) // i18n-ignore: server log
    return failure(502, "upstream")
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AssistantStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeEvent(event)))
        } catch {
          // The shopper closed the chat; nothing is listening any more.
        }
      }
      let text = ""
      try {
        for (let step = first; !step.done; step = await reply.next()) {
          text += step.value
          send({ type: "text", text: step.value })
        }
        if (text.trim() === "") send({ type: "error" })
        else send({ type: "products", items: linkedProducts(text, context.products, locale) })
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("assistant: Gemini stream failed:", messageOf(error)) // i18n-ignore: server log
          send({ type: "error" })
        }
      } finally {
        try {
          controller.close()
        } catch {
          // already closed by a disconnect
        }
      }
    },
    cancel() {
      void reply.return(undefined)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function failure(status: number, code: string) {
  return NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } })
}

// Browsers always send Origin on a POST from a page; it must name this site.
// The host compared is the one the request was addressed to (behind a proxy,
// the forwarded one).
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return false
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host
  return originHost === host.split(",")[0].trim()
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

// The cards under a reply: the products it linked to that really exist, in
// the order it mentioned them.
function linkedProducts(text: string, products: ProductWithCategory[], locale: Locale): AssistantProduct[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  return extractProductSlugs(text)
    .flatMap((slug) => bySlug.get(slug) ?? [])
    .slice(0, ASSISTANT_LIMITS.maxProducts)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: nameOf(product, locale),
      price: product.price,
      compareAtPrice: isOnSale(product) ? product.compare_at_price : null,
      imageUrl: product.image_url ?? null,
      inStock: product.stock > 0,
    }))
}

function messageOf(error: unknown): string {
  if (error instanceof Error) {
    const status = (error as { status?: unknown }).status
    return typeof status === "number" ? `${status} ${error.message}` : error.message
  }
  return String(error)
}
