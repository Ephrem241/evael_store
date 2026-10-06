import { describe, expect, it } from "vitest"

import { telegramLink, telLink, whatsappLink } from "@/lib/contact-links"

describe("contact links", () => {
  it("builds a tel: link from a phone number", () => {
    expect(telLink("+251949888889")).toBe("tel:+251949888889")
    expect(telLink("+251 94 988 8889")).toBe("tel:+251949888889")
    expect(telLink("call us")).toBeNull()
    expect(telLink(null)).toBeNull()
  })

  it("builds a WhatsApp link with digits only", () => {
    expect(whatsappLink("+251949888889")).toBe("whatsapp://send?phone=251949888889")
    expect(whatsappLink("+251 (94) 988-8889")).toBe("whatsapp://send?phone=251949888889")
    expect(whatsappLink("")).toBeNull()
  })

  it("builds a Telegram link from a phone number or a username", () => {
    expect(telegramLink("+251949888889")).toBe("tg://resolve?phone=251949888889")
    expect(telegramLink("@evael_store")).toBe("https://t.me/evael_store")
    expect(telegramLink("evael_store")).toBe("https://t.me/evael_store")
    expect(telegramLink("ab")).toBeNull()
    expect(telegramLink("not a handle!")).toBeNull()
  })
})
