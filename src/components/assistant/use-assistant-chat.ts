"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { ASSISTANT_LIMITS } from "@/lib/ai/limits"
import { createNdjsonReader } from "@/lib/ai/ndjson"
import type { AssistantStreamEvent, AssistantTurn } from "@/lib/ai/types"
import { useAssistantStore, type AssistantErrorKind } from "@/lib/store/assistant"

// Asking the assistant: adds the question, posts the conversation to
// /api/assistant and writes the reply into the store as it streams in. One
// reply at a time. Lives in AssistantPanel, which stays mounted once opened,
// so a reply keeps arriving while the panel is closed.

let counter = 0
const newId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`

function errorFor(status: number): AssistantErrorKind {
  if (status === 429) return "tooMany"
  if (status === 503) return "unavailable"
  return "generic"
}

// What is sent: the conversation so far, minus replies that failed.
function historyToSend(): AssistantTurn[] {
  return useAssistantStore
    .getState()
    .messages.filter((message) => message.status !== "error" && message.text.trim() !== "")
    .map(({ role, text }) => ({ role, text }))
}

export function useAssistantChat() {
  const messages = useAssistantStore((state) => state.messages)
  const [busy, setBusy] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const requestReply = useCallback(async () => {
    const { add, update } = useAssistantStore.getState()
    const history = historyToSend()
    const replyId = newId()
    add({ id: replyId, role: "model", text: "", status: "streaming" })
    const fail = (error: AssistantErrorKind) => update(replyId, () => ({ status: "error", error }))

    const controller = new AbortController()
    controllerRef.current = controller
    setBusy(true)
    try {
      if (!navigator.onLine) return fail("offline")
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })
      if (!response.ok || !response.body) return fail(errorFor(response.status))

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      const ndjson = createNdjsonReader()
      let failed = false
      const apply = (events: AssistantStreamEvent[]) => {
        for (const event of events) {
          if (event.type === "text") update(replyId, (message) => ({ text: message.text + event.text }))
          else if (event.type === "products") update(replyId, () => ({ products: event.items }))
          else failed = true
        }
      }
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        apply(ndjson.push(value))
      }
      apply(ndjson.flush())
      if (failed) fail("generic")
      else update(replyId, () => ({ status: undefined }))
    } catch {
      if (controller.signal.aborted) update(replyId, () => ({ status: "stopped" }))
      else fail(navigator.onLine ? "generic" : "offline")
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
      setBusy(false)
    }
  }, [])

  const ask = useCallback(
    (question: string) => {
      const text = question.trim().slice(0, ASSISTANT_LIMITS.maxUserChars)
      if (text === "" || controllerRef.current) return
      useAssistantStore.getState().add({ id: newId(), role: "user", text })
      void requestReply()
    },
    [requestReply]
  )

  // Asks again for the reply that failed (the question is already there).
  const retry = useCallback(
    (failedReplyId: string) => {
      if (controllerRef.current) return
      useAssistantStore.getState().remove(failedReplyId)
      void requestReply()
    },
    [requestReply]
  )

  const stop = useCallback(() => controllerRef.current?.abort(), [])

  const clear = useCallback(() => {
    controllerRef.current?.abort()
    useAssistantStore.getState().clear()
  }, [])

  return { messages, busy, ask, retry, stop, clear }
}
