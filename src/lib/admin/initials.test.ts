import { describe, expect, it } from "vitest"

import { initialsOf } from "@/lib/admin/initials"

describe("initialsOf", () => {
  it("takes the first letter of the first and last word", () => {
    expect(initialsOf("Abebe Kebede")).toBe("AK")
    expect(initialsOf("Selamawit Tadesse Bekele")).toBe("SB")
  })

  it("uses one letter for a one-word name", () => {
    expect(initialsOf("selam")).toBe("S")
  })

  it("ignores extra spaces", () => {
    expect(initialsOf("  Daniel   Girma ")).toBe("DG")
  })

  it("works for names written in Ethiopic", () => {
    expect(initialsOf("አበበ ከበደ")).toBe("አከ")
  })

  it("gives a placeholder for a blank name", () => {
    expect(initialsOf("   ")).toBe("?")
  })
})
