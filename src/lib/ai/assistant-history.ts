import { z } from "zod"

import { ASSISTANT_LIMITS } from "@/lib/ai/limits"
import type { AssistantTurn } from "@/lib/ai/types"

// The conversation as the browser sends it (it keeps the history for the
// visit; the server stores nothing). Anyone can POST to the route, so this is
// the one place that decides what reaches the model: the right roles, a
// shopper's message last, every message within its length, and the whole
// within budget — oldest turns are dropped first.

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string() }))
    .min(1)
    .max(100),
})

/** The turns to send to the model, or null when the request is not acceptable. */
export function parseHistory(body: unknown): AssistantTurn[] | null {
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return null

  // A reply that failed part-way may have left nothing behind: skip it, and
  // join what then sits side by side under one role (the model expects the
  // two sides to take turns).
  const turns: AssistantTurn[] = []
  for (const message of parsed.data.messages) {
    const text = message.text.trim()
    if (text === "") continue
    if (message.role === "user" && text.length > ASSISTANT_LIMITS.maxUserChars) return null
    const capped = message.role === "model" ? text.slice(0, ASSISTANT_LIMITS.maxModelChars) : text
    const previous = turns.at(-1)
    if (previous?.role === message.role) previous.text = `${previous.text}\n\n${capped}`
    else turns.push({ role: message.role, text: capped })
  }

  // (Each message was checked above; joined ones are bounded by the total.)
  const last = turns.at(-1)
  if (!last || last.role !== "user" || last.text.length > ASSISTANT_LIMITS.maxTotalChars) return null

  // Keep the most recent turns that fit, always starting with a shopper's message.
  let kept = turns.slice(-ASSISTANT_LIMITS.maxTurns)
  while (kept.length > 1 && total(kept) > ASSISTANT_LIMITS.maxTotalChars) kept = kept.slice(1)
  while (kept[0].role !== "user") kept = kept.slice(1)
  return kept
}

function total(turns: AssistantTurn[]): number {
  return turns.reduce((sum, turn) => sum + turn.text.length, 0)
}
