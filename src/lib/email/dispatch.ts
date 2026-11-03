import { renderEmail, type EmailContext } from "@/lib/email/templates"
import type { OutboxRow, RenderedEmail } from "@/lib/email/types"

// Sends what is queued in the database's email outbox (migration 0019):
// claim a batch, write and send each email, settle each one. The mailer and
// the outbox are passed in (Resend and Supabase in production, fakes in tests).
// A failed send is recorded and the email goes back in the queue, so the next
// dispatch retries it (the database gives up after 5 attempts).
//
// A MailerSetupError is different: the mail service refuses everything until
// someone fixes the account (an unverified domain, a wrong key). Trying the
// rest would fail too, so the batch stops and the emails go back uncounted.

export class MailerSetupError extends Error {}

export interface OutgoingMessage extends RenderedEmail {
  from: string
  // The same for every attempt at one queued email, so the mail service can
  // refuse to deliver it twice.
  idempotencyKey?: string
}

export interface Mailer {
  send(message: OutgoingMessage): Promise<void>
}

export interface Outbox {
  claim(limit: number): Promise<OutboxRow[]>
  complete(id: string, error: string | null): Promise<void>
  release(ids: string[], error: string): Promise<void>
}

export interface DispatchResult {
  sent: number
  failed: number
  skipped: number
  // The mail service's reason, when a setup problem stopped this dispatch.
  blocked?: string
}

// Addresses that can never receive mail (RFC 2606 / 6761), such as the test
// suite's e2e-…@example.com accounts. Sending to them would only bounce and
// hurt the shop's sender reputation, so those emails are settled unsent.
const RESERVED = /@(?:[^@]*\.)?(example\.(?:com|org|net)|[^@]+\.(?:test|invalid|example|localhost)|localhost)$/i

export function isUndeliverable(address: string | null | undefined): boolean {
  return !address || RESERVED.test(address.trim())
}

// The address that decides whether a row is test traffic: the customer for
// order emails (including the owner's alert about a test order), the sender
// for contact messages and the admin's replies to them.
function originAddress(row: OutboxRow): string | null {
  if (row.kind === "contact" || row.kind === "contact_reply") return row.contact?.email ?? null
  return row.order?.customer_email ?? null
}

export async function dispatchEmails({
  mailer,
  outbox,
  from,
  context,
  batchSize = 10,
  maxBatches = 3,
}: {
  mailer: Mailer
  outbox: Outbox
  from: string
  context: EmailContext
  batchSize?: number
  maxBatches?: number
}): Promise<DispatchResult> {
  const result: DispatchResult = { sent: 0, failed: 0, skipped: 0 }

  for (let batch = 0; batch < maxBatches; batch++) {
    const rows = await outbox.claim(batchSize)
    for (const [index, row] of rows.entries()) {
      const email = isUndeliverable(originAddress(row)) ? null : renderEmail(row, context)
      if (!email || isUndeliverable(email.to)) {
        await outbox.complete(row.id, null)
        result.skipped++
        continue
      }
      try {
        await mailer.send({ ...email, from, idempotencyKey: `email-outbox-${row.id}` })
        await outbox.complete(row.id, null)
        result.sent++
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (error instanceof MailerSetupError) {
          await outbox.release(rows.slice(index).map((r) => r.id), message)
          result.blocked = message
          return result
        }
        await outbox.complete(row.id, message || "send failed")
        result.failed++
      }
    }
    if (rows.length < batchSize) break
  }
  return result
}
