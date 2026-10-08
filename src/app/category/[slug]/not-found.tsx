import Link from "next/link"
import { PackageX } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { StatusPage } from "@/components/feedback/status-page"
import { Button } from "@/components/ui/button"

export default async function CategoryNotFound() {
  const t = await getT()

  return (
    <StatusPage
      icon={PackageX}
      title={t("catalog.categoryNotFound")}
      description={t("catalog.categoryNotFoundText")}
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/categories">{t("catalog.browseCategories")}</Link>
          </Button>
          <Button asChild variant="ghost-link" className="text-sm font-semibold">
            <Link href="/">{t("common.backHome")}</Link>
          </Button>
        </>
      }
    />
  )
}
