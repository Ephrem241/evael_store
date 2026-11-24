import type { Metadata } from "next"

import { privateMetadata } from "@/lib/seo/metadata"
import { getT } from "@/lib/i18n/server"
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content"

// Not for search results: it belongs to one visitor (see privateMetadata).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return privateMetadata(t("admin.dashboard.title"))
}

// The page header lives in the content: its period menu drives the numbers.
export default function Page() {
  return <AdminDashboardContent />
}
