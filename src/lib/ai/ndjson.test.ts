import { describe, expect, it } from "vitest"

import { createNdjsonReader, encodeEvent } from "@/lib/ai/ndjson"
import type { AssistantStreamEvent } from "@/lib/ai/types"

const product = { id: "p1", slug: "silk-scarf", name: "Silk Scarf", price: 650, compareAtPrice: null, imageUrl: null, inStock: true }

describe("NDJSON events", () => {
  it("round-trips every event, even text with newlines in it", () => {
    const events: AssistantStreamEvent[] = [
      { type: "text", text: "Line one\nLine two" },
      { type: "products", items: [product] },
      { type: "error" },
    ]
    const wire = events.map(encodeEvent).join("")
    expect(wire.split("\n").filter(Boolean)).toHaveLength(3)
    expect(createNdjsonReader().push(wire)).toEqual(events)
  })

  it("puts back together lines that arrive in pieces", () => {
    const wire = encodeEvent({ type: "text", text: "Hello" }) + encodeEvent({ type: "text", text: "ሰላም" })
    const reader = createNdjsonReader()
    const received = [...wire].flatMap((char) => reader.push(char))
    expect(received).toEqual([
      { type: "text", text: "Hello" },
      { type: "text", text: "ሰላም" },
    ])
  })

  it("reads a last line that has no newline when the stream ends", () => {
    const reader = createNdjsonReader()
    expect(reader.push('{"type":"text","text":"end"}')).toEqual([])
    expect(reader.flush()).toEqual([{ type: "text", text: "end" }])
    expect(reader.flush()).toEqual([])
  })

  it("skips anything that is not a well-formed event", () => {
    const reader = createNdjsonReader()
    const wire = [
      "not json",
      "42",
      '{"type":"text"}',
      '{"type":"shout","text":"x"}',
      JSON.stringify({ type: "products", items: [product, { slug: "no-id" }, null] }),
      "",
    ].join("\n")
    expect(reader.push(wire)).toEqual([{ type: "products", items: [product] }])
  })
})
