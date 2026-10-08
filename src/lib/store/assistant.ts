import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { ASSISTANT_LIMITS } from "@/lib/ai/limits"
import type { AssistantProduct, AssistantRole } from "@/lib/ai/types"

// The shopping assistant's conversation, kept for the visit: in the tab's
// session storage, so it survives moving between pages and reloads, and is
// gone when the tab is closed. It never leaves the browser except as the
// question sent to /api/assistant.

export type AssistantErrorKind = "generic" | "tooMany" | "offline" | "unavailable"

export interface AssistantMessage {
  id: string
  role: AssistantRole
  text: string
  /** A reply's product cards (checked by the server). */
  products?: AssistantProduct[]
  /** A reply still being written, stopped by the shopper, or failed. */
  status?: "streaming" | "stopped" | "error"
  error?: AssistantErrorKind
}

interface AssistantState {
  messages: AssistantMessage[]
  add: (message: AssistantMessage) => void
  update: (id: string, change: (message: AssistantMessage) => Partial<AssistantMessage>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      messages: [],
      add: (message) =>
        set((state) => ({ messages: [...state.messages, message].slice(-ASSISTANT_LIMITS.maxStoredMessages) })),
      update: (id, change) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === id ? { ...message, ...change(message) } : message)),
        })),
      remove: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),
      clear: () => set({ messages: [] }),
    }),
    {
      name: "evael-assistant",
      storage: createJSONStorage(() => sessionStorage),
      // A reply cut off by a reload is stopped, not still being written.
      partialize: (state) => ({
        messages: state.messages.map((message) =>
          message.status === "streaming" ? { ...message, status: "stopped" as const } : message
        ),
      }),
    }
  )
)
