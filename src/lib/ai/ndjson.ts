import type { AssistantStreamEvent } from "@/lib/ai/types"

// The assistant's answer travels as NDJSON: one JSON event per line
// (JSON.stringify never writes a raw newline, so a line is always one event).
// The network may split or join lines anywhere, so the reader keeps the
// unfinished end of what it has received until the rest arrives.

export function encodeEvent(event: AssistantStreamEvent): string {
  return `${JSON.stringify(event)}\n`
}

export interface NdjsonReader {
  /** Feeds a received chunk; returns the events it completed. */
  push(chunk: string): AssistantStreamEvent[]
  /** The stream ended: whatever is left over, if it is a whole event. */
  flush(): AssistantStreamEvent[]
}

export function createNdjsonReader(): NdjsonReader {
  let buffer = ""
  const parse = (lines: string[]) => lines.flatMap((line) => (line.trim() ? toEvent(line) : []))

  return {
    push(chunk) {
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      return parse(lines)
    },
    flush() {
      const rest = buffer
      buffer = ""
      return parse([rest])
    },
  }
}

// Anything that isn't a well-formed event is skipped, not trusted.
function toEvent(line: string): AssistantStreamEvent[] {
  let value: unknown
  try {
    value = JSON.parse(line)
  } catch {
    return []
  }
  if (typeof value !== "object" || value === null) return []
  const event = value as Record<string, unknown>
  if (event.type === "text" && typeof event.text === "string") return [{ type: "text", text: event.text }]
  if (event.type === "error") return [{ type: "error" }]
  if (event.type === "products" && Array.isArray(event.items)) {
    return [{ type: "products", items: event.items.filter(isProduct) }]
  }
  return []
}

function isProduct(item: unknown): item is Extract<AssistantStreamEvent, { type: "products" }>["items"][number] {
  if (typeof item !== "object" || item === null) return false
  const p = item as Record<string, unknown>
  return (
    typeof p.id === "string" &&
    typeof p.slug === "string" &&
    typeof p.name === "string" &&
    typeof p.price === "number" &&
    (p.compareAtPrice === null || typeof p.compareAtPrice === "number") &&
    (p.imageUrl === null || typeof p.imageUrl === "string") &&
    typeof p.inStock === "boolean"
  )
}
