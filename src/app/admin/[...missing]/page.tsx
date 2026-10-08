import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"

// Any /admin address that matches no admin page lands here, so its 404
// (admin/not-found.tsx) is drawn inside the admin's frame rather than as the
// shop's page with no shop around it.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("common.pageNotFound"))
}

export default function MissingAdminPage() {
  notFound()
}
