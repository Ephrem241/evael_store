// How much the shopping assistant handles at once — shared by the route
// (server) and the chat panel (browser), so it holds no configuration or
// secrets (those are in config.ts, server only).

// What one request may carry. The browser keeps the conversation and sends it
// whole each time (nothing is stored on the server), so these bound both the
// cost of a request and what a misbehaving client can make the server forward.
export const ASSISTANT_LIMITS = {
  /** Turns sent to the model; older ones are dropped from the front. */
  maxTurns: 20,
  /** One shopper message. The input box enforces the same number. */
  maxUserChars: 1000,
  /** One earlier assistant reply, as sent back by the browser. */
  maxModelChars: 4000,
  /** The whole conversation sent to the model. */
  maxTotalChars: 12_000,
  /** The request body, before it is parsed. */
  maxBodyBytes: 32 * 1024,
  /** Product cards under one reply (the prompt asks for at most this many). */
  maxProducts: 4,
  /** Products described to the model. The catalog is tens of rows today. */
  maxCatalogProducts: 400,
  /** Messages the browser keeps for the visit. */
  maxStoredMessages: 30,
} as const
