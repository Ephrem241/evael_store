import { en } from "@/locales/en"

import { createTestProduct, placeOrderAs } from "./support/db"
import { expect, test } from "./support/fixtures"
import { signIn } from "./support/ui"

// The admin's frame (EVAEL_ADMIN_REDESIGN_SPEC sections 4 and 8): the sidebar
// with its Products group, worked from the keyboard; the top bar's search;
// the phone's drawer; and a 404 that stays inside the admin.
test.describe("Admin shell", () => {
  test("the sidebar works from the keyboard and remembers whether a group is open", async ({ page, adminUser, problems }) => {
    await signIn(page, adminUser)
    await page.goto("/admin")
    const nav = page.getByRole("navigation", { name: en.admin.nav.label })
    const dashboard = nav.getByRole("link", { name: en.admin.nav.dashboard })
    const products = nav.getByRole("button", { name: en.admin.nav.products })
    const allProducts = nav.getByRole("link", { name: en.admin.nav.allProducts })

    await dashboard.focus()
    await page.keyboard.press("ArrowDown")
    await expect(products).toBeFocused()
    await expect(products).toHaveAttribute("aria-expanded", "false")
    await expect(allProducts).toBeHidden()

    await page.keyboard.press("ArrowRight")
    await expect(products).toHaveAttribute("aria-expanded", "true")
    await page.keyboard.press("ArrowDown")
    await expect(allProducts).toBeFocused()
    await page.keyboard.press("ArrowLeft")
    await expect(products).toBeFocused()
    await page.keyboard.press("End")
    await expect(nav.getByRole("link", { name: en.admin.nav.settings })).toBeFocused()
    await page.keyboard.press("Home")
    await expect(dashboard).toBeFocused()

    await allProducts.focus()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/admin\/products$/)
    await expect(allProducts).toHaveAttribute("aria-current", "page")

    // Still open on a page outside the group, after a reload; closing it is remembered too.
    await page.goto("/admin/orders")
    await expect(products).toHaveAttribute("aria-expanded", "true")
    await products.click()
    await page.reload()
    await expect(products).toHaveAttribute("aria-expanded", "false")

    expect(problems.errors).toEqual([])
  })

  test("the skip link jumps past the menu and the top bar to the page", async ({ page, adminUser }) => {
    await signIn(page, adminUser)
    await page.goto("/admin")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await page.keyboard.press("Tab")
    await expect(page.getByRole("link", { name: en.nav.skipToContent })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("main")).toBeFocused()
  })

  test("the search finds a product, an order and a customer, and opens them", async ({ page, adminUser, shopper, problems }) => {
    const product = await createTestProduct({ price: 300, stock: 5 })
    const order = await placeOrderAs(shopper, [{ product_id: product.id, quantity: 1 }])
    await signIn(page, adminUser)
    await page.goto("/admin")

    const search = page.getByRole("combobox", { name: en.admin.search.label })
    const results = page.getByRole("listbox", { name: en.admin.search.label })

    await search.fill(product.name_en)
    await expect(results.getByRole("group", { name: en.admin.search.products }).getByRole("option", { name: new RegExp(product.name_en) })).toBeVisible()
    await search.press("Enter")
    await expect(page).toHaveURL(new RegExp(`/admin/products/${product.id}/edit$`))
    await expect(search).toHaveValue("")

    await search.fill(order.order_number)
    await expect(results.getByRole("group", { name: en.admin.search.orders }).getByRole("option", { name: new RegExp(order.order_number) }).first()).toBeVisible()
    await search.press("Enter")
    await expect(page).toHaveURL(new RegExp(`/admin/orders/${order.id}$`))

    await search.fill(shopper.email)
    await expect(results.getByRole("group", { name: en.admin.search.customers }).getByRole("option", { name: new RegExp(shopper.fullName) })).toBeVisible()
    await search.press("Escape")
    await expect(results).toBeHidden()

    await search.fill("zzqx-nothing-is-called-this")
    await expect(page.getByText(en.admin.search.noResults.replace("{query}", "zzqx-nothing-is-called-this")).first()).toBeVisible()

    expect(problems.errors).toEqual([])
  })

  test("an address that is no admin page shows the 404 inside the admin", async ({ page, adminUser }) => {
    await signIn(page, adminUser)
    await page.goto("/admin/this-page-does-not-exist")
    await expect(page.getByRole("heading", { level: 1, name: en.common.pageNotFound })).toBeVisible()
    await expect(page.getByRole("navigation", { name: en.admin.nav.label })).toBeVisible()
    await page.locator("main").getByRole("link", { name: en.admin.shell.backToDashboard }).click()
    await expect(page).toHaveURL(/\/admin$/)
  })

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

    test("the menu opens as a drawer and closes when a page is chosen; the search opens from its icon", async ({ page, adminUser, problems }) => {
      await signIn(page, adminUser)
      await page.goto("/admin")

      await page.getByRole("button", { name: en.nav.openMenu }).click()
      const drawer = page.getByRole("dialog", { name: en.admin.nav.label })
      await expect(drawer).toBeVisible()
      await drawer.getByRole("link", { name: en.admin.nav.orders }).click()
      await expect(page).toHaveURL(/\/admin\/orders$/)
      await expect(drawer).toBeHidden()

      await page.getByRole("button", { name: en.admin.search.open }).click()
      const search = page.getByRole("combobox", { name: en.admin.search.label })
      await expect(search).toBeFocused()
      await page.getByRole("button", { name: en.admin.search.close }).click()
      await expect(search).toBeHidden()
      await expect(page.getByRole("button", { name: en.admin.search.open })).toBeFocused()

      expect(problems.errors).toEqual([])
    })
  })
})
