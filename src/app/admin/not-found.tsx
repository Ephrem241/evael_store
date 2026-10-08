import Link from "next/link"

import { getT } from "@/lib/i18n/server"
import { StatusPage } from "@/components/feedback/status-page"
import { Button } from "@/components/ui/button"

// An /admin address that is no page (see [...missing]/page.tsx): the 404
// inside the admin's frame, leading back to the dashboard.
export default async function AdminNotFound() {
  const t = await getT()

  return (
    <StatusPage
      code="404"
      title={t("common.pageNotFound")}
      description={t("common.pageNotFoundText")}
      actions={
        <Button asChild size="lg">
          <Link href="/admin">{t("admin.shell.backToDashboard")}</Link>
        </Button>
      }
    />
  )
}
