import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { StatusPage } from "@/components/feedback/status-page"
import { Button } from "@/components/ui/button"

// The site-wide 404 (any URL that matches no route, e.g. a footer link to a
// page that isn't built yet). Next's built-in one is English-only.
export default async function NotFound() {
  const t = await getT()

  return (
    <StatusPage
      code="404"
      title={t("common.pageNotFound")}
      description={t("common.pageNotFoundText")}
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/">{t("common.backHome")}</Link>
          </Button>
          <Button asChild variant="ghost-link" className="text-sm font-semibold">
            <Link href="/categories">
              {t("catalog.browseCategories")}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        </>
      }
    />
  )
}
