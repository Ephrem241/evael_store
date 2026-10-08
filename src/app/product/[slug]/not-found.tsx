import Link from "next/link"
import { PackageX } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { StatusPage } from "@/components/feedback/status-page"
import { Button } from "@/components/ui/button"

export default async function ProductNotFound() {
  const t = await getT()

  return (
    <StatusPage
      icon={PackageX}
      title={t("catalog.productNotFound")}
      description={t("catalog.productNotFoundText")}
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/shop">{t("nav.shopAll")}</Link>
          </Button>
          <Button asChild variant="ghost-link" className="text-sm font-semibold">
            <Link href="/">{t("common.backHome")}</Link>
          </Button>
        </>
      }
    />
  )
}
