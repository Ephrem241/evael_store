"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import { StatusPage } from "@/components/feedback/status-page"
import { Button } from "@/components/ui/button"

// Catches an unexpected error while rendering a page, inside the normal
// layout (header, footer and the language switcher still work).
//
// "Try again" must be `retry`, not `reset`: `reset` only clears the error and
// shows the SAME server response again, so a failure that happened on the
// server (the database briefly unreachable, a timeout) would just reappear.
// `retry` asks the server to render the page again.
export default function RouteError({ error, retry }: { error: Error; retry: () => void }) {
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
            <Link href="/">{t("common.backHome")}</Link>
          </Button>
        </>
      }
    />
  )
}
