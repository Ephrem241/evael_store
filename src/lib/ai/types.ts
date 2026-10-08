// Shapes shared by the assistant's route (server) and its chat panel (browser).

export type AssistantRole = "user" | "model"

/** One message of the conversation, as the browser sends it back each time. */
export interface AssistantTurn {
  role: AssistantRole
  text: string
}

/**
 * A product the reply linked to, checked against the live catalog by the
 * server — the card under the reply. Name in the shopper's language.
 */
export interface AssistantProduct {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  imageUrl: string | null
  inStock: boolean
}

/**
 * The route answers with one JSON object per line (NDJSON): the reply's text
 * as it is written, then the products it linked to, or an error if the model
 * stopped part-way.
 */
export type AssistantStreamEvent =
  | { type: "text"; text: string }
  | { type: "products"; items: AssistantProduct[] }
  | { type: "error" }
