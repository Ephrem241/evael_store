import { mkdirSync } from "node:fs"
import path from "node:path"

import type { Page } from "@playwright/test"

import { en } from "@/locales/en"

import { stockedProducts } from "./support/db"
import { test } from "./support/fixtures"
import { signIn } from "./support/ui"

// Screenshots of the admin for design review against
// docs/design/admin-dashboard.png.png. Not a check (nothing about pixels is
// asserted) and not part of the normal run:
//
//   ADMIN_SCREENS=1 npx playwright test admin-screens
//
// The pictures land in test-results/admin-screens/.
const OUT = path.join("test-results", "admin-screens")

const SIZES = [
  { name: "1536", width: 1536, height: 1024 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
] as const

const PAGES = [
  ["dashboard", "/admin"],
  ["products", "/admin/products"],
  ["orders", "/admin/orders"],
] as const

async function settle(page: Page) {
  await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: 15_000 }).catch(() => {})
  await page.waitForTimeout(500)
}

test.describe("Admin screenshots", () => {
  test.skip(!process.env.ADMIN_SCREENS, "Set ADMIN_SCREENS=1 to take the admin review screenshots.")

  test("the admin at 1536, 768 and 390 pixels", async ({ browser, adminUser }) => {
    test.setTimeout(300_000)
    mkdirSync(OUT, { recursive: true })
    const [product] = await stockedProducts(1)

    const login = await browser.newContext()
    const loginPage = await login.newPage()
    await signIn(loginPage, adminUser)
    const storageState = await login.storageState()
    await login.close()

    for (const size of SIZES) {
      const phone = size.width < 768
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        isMobile: phone,
        hasTouch: phone,
        reducedMotion: "reduce",
        storageState,
      })
      const page = await context.newPage()

      for (const [name, url] of PAGES) {
        await page.goto(url)
        await settle(page)
        await page.screenshot({ path: path.join(OUT, `${name}-${size.name}.png`), fullPage: true })
      }

      await page.goto("/admin")
      await settle(page)
      if (phone) {
        await page.getByRole("button", { name: en.nav.openMenu }).click()
        await page.waitForTimeout(400)
        await page.screenshot({ path: path.join(OUT, `drawer-${size.name}.png`) })
        await page.keyboard.press("Escape")
        await page.getByRole("button", { name: en.admin.search.open }).click()
      }
      const search = page.getByRole("combobox", { name: en.admin.search.label })
      await search.fill(product.name_en.split(" ")[0])
      await page.getByRole("listbox", { name: en.admin.search.label }).waitFor()
      await page.screenshot({ path: path.join(OUT, `search-${size.name}.png`) })

      await context.close()
    }
  })
})
