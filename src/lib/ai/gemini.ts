import { GoogleGenAI } from "@google/genai"

import { assistantModel, geminiApiKey } from "@/lib/ai/config"
import type { AssistantTurn } from "@/lib/ai/types"

// The only file that talks to Gemini (server only: it holds the key). It uses
// the Interactions API, which Google recommends for new work, statelessly:
// `store: false`, and the whole conversation is sent each time, because the
// browser — not Google, not our database — keeps the history for the visit.
//
// Yields the reply's text as the model writes it. Throws when the call fails
// or the model reports an error part-way; aborting `signal` (the shopper
// closed the chat) stops the call.

let client: GoogleGenAI | undefined

export async function* streamReply({
  system,
  history,
  signal,
}: {
  system: string
  history: AssistantTurn[]
  signal?: AbortSignal
}): AsyncGenerator<string> {
  const apiKey = geminiApiKey()
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set") // i18n-ignore: developer-facing
  client ??= new GoogleGenAI({ apiKey })

  const stream = await client.interactions.create(
    {
      model: assistantModel(),
      system_instruction: system,
      input: history.map((turn) =>
        turn.role === "user"
          ? { type: "user_input" as const, content: [{ type: "text" as const, text: turn.text }] }
          : { type: "model_output" as const, content: [{ type: "text" as const, text: turn.text }] }
      ),
      generation_config: {
        // A shop assistant needs little reasoning; low thinking keeps the
        // first words quick. The output cap leaves room for Amharic, which
        // takes more tokens per word than English.
        thinking_level: "low",
        max_output_tokens: 1500,
      },
      store: false,
      stream: true,
    },
    { signal }
  )

  for await (const event of stream) {
    if (event.event_type === "step.delta" && event.delta.type === "text") {
      yield event.delta.text
    } else if (event.event_type === "error") {
      throw new Error(`Gemini stream error: ${event.error?.message ?? event.error?.code ?? "unknown"}`) // i18n-ignore: developer-facing
    } else if (event.event_type === "interaction.completed" && event.interaction.status === "failed") {
      throw new Error("Gemini interaction failed") // i18n-ignore: developer-facing
    }
  }
}
