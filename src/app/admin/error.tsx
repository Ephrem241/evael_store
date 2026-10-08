"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import { StatusPage } from "@/components/feedback/status-page"
import { Button } from "@/components/ui/button"

// The site's error page (app/error.tsx), but inside the admin's frame: the
// sidebar and top bar stay, and the way back leads to the dashboard.
export default function AdminError({ error, retry }: { error: Error; retry: () => void }) {
  const t = useT()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage
      icon={AlertTriangle}
      title={t("common.errorTitle")}
      description={t("common.errorText")}
      actions={
        <>
          <Button size="lg" onClick={retry}>
            <RotateCcw aria-hidden />
            {t("common.retry")}
          </Button>
          <Button asChild variant="ghost-link" className="text-sm font-semibold">
            <Link href="/admin">{t("admin.shell.backToDashboard")}</Link>
          </Button>
        </>
      }
    />
  )
}
