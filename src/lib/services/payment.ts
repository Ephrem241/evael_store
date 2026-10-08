// Payment provider abstraction (spec Section 57): "Do not hardwire checkout
// directly to one provider." Adding Chapa/Telebirr later means adding
// another PaymentProvider to the array below and flipping `enabled: true` —
// no checkout code changes.
//
// NOTE for that day: a real online provider cannot be trusted to report
// "paid" from the browser. The order's payment_status is set by the database
// (place_order: cash on delivery => pending) and an online provider must
// confirm payment server-side (order first, then a webhook) — that needs a
// server route holding the provider's secret and is deliberately not faked
// here.

import { translate } from "@/lib/i18n/translate"
import type { MessageKey } from "@/lib/i18n/translator"

export type PaymentStatus = "pending" | "paid" | "failed"

export interface PaymentResult {
  success: boolean
  paymentStatus: PaymentStatus
  error?: string
}

export interface PaymentProvider {
  id: string
  // Dictionary keys, not text: the checkout translates them when rendering.
  label: MessageKey
  description?: MessageKey
  enabled: boolean
  process(context: { total: number }): Promise<PaymentResult>
}

export const cashOnDeliveryProvider: PaymentProvider = {
  id: "cod",
  label: "checkout.payment.codLabel",
  description: "checkout.payment.codDescription",
  enabled: true,
  async process() {
    // No money moves upfront with COD, so "paid" would be a lie until the
    // courier actually collects payment on delivery.
    return { success: true, paymentStatus: "pending" }
  },
}

export const manualPaymentPlaceholderProvider: PaymentProvider = {
  id: "manual",
  label: "checkout.payment.manualLabel",
  description: "checkout.payment.manualDescription",
  enabled: false,
  async process() {
    return { success: false, paymentStatus: "failed", error: translate("checkout.errors.paymentUnavailable") }
  },
}

export const paymentProviders: PaymentProvider[] = [
  cashOnDeliveryProvider,
  manualPaymentPlaceholderProvider,
]

export function getPaymentProvider(id: string): PaymentProvider | undefined {
  return paymentProviders.find((p) => p.id === id)
}

// Every way of paying the shop mentions — the home page's "Pay your way", the
// cart's "We accept" — from this one list, so no two places can disagree.
// Only Cash on Delivery is a real provider today (it follows the provider's
// own `enabled`); the Ethiopian banks and wallet are shown as coming soon
// until checkout can take them (then they get a provider above and turn
// available here). Bank and wallet names are proper nouns, the same in both
// languages; no logos are shown until their owners allow it.
export interface PaymentMethod {
  id: string
  kind: "cash" | "wallet" | "bank"
  available: boolean
  /** A dictionary key (translated), or a proper noun shown as is. */
  label: { key: MessageKey } | { name: string }
}

export const paymentMethods: PaymentMethod[] = [
  { id: "cod", kind: "cash", available: cashOnDeliveryProvider.enabled, label: { key: "home.payments.cod" } },
  { id: "telebirr", kind: "wallet", available: false, label: { name: "telebirr" } },
  { id: "cbe", kind: "bank", available: false, label: { name: "CBE" } },
  { id: "awash", kind: "bank", available: false, label: { name: "Awash Bank" } },
  { id: "dashen", kind: "bank", available: false, label: { name: "Dashen Bank" } },
  { id: "abyssinia", kind: "bank", available: false, label: { name: "Bank of Abyssinia" } },
]
