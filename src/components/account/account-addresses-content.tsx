"use client"

import { CardListSkeleton } from "@/components/feedback/skeletons"
import { useState } from "react"
import { MapPin, MapPinOff, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useT } from "@/lib/i18n/provider"
import { cityLabel } from "@/lib/services/delivery"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { useMyAddresses } from "@/lib/hooks/use-addresses"
import {
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  type AddressRecord,
} from "@/lib/services/addresses"
import type { AddressValues } from "@/components/account/address-schema"
import { AddressForm } from "@/components/account/address-form"
import { EmptyState } from "@/components/feedback/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function toFormValues(address: AddressRecord): AddressValues {
  return {
    fullName: address.full_name,
    phone: address.phone,
    city: address.city,
    subCity: address.sub_city,
    woreda: address.woreda,
    address: address.address,
    notes: address.notes,
  }
}

function AccountAddressesContent() {
  const t = useT()
  const { user, ready } = useRequireAuth("/login?redirect=/account/addresses")
  const { data: addresses, loading, error, reload } = useMyAddresses(user?.id)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!ready || !user || loading) return <CardListSkeleton rows={2} />

  if (error || !addresses) {
    return (
      <EmptyState
        icon={MapPinOff}
        title={t("account.addresses.loadFailed")}
        description={t("account.addresses.refresh")}
      />
    )
  }

  function openAdd() {
    setEditingId(null)
    setDialogOpen(true)
  }

  function openEdit(id: string) {
    setEditingId(id)
    setDialogOpen(true)
  }

  async function handleSubmit(values: AddressValues) {
    const input = {
      full_name: values.fullName,
      phone: values.phone,
      city: values.city,
      sub_city: values.subCity,
      woreda: values.woreda,
      address: values.address,
      notes: values.notes,
    }

    const result = editingId
      ? await updateAddress(editingId, input)
      : await addAddress(user!.id, input)

    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(editingId ? t("account.addresses.updated") : t("account.addresses.saved"))
    setDialogOpen(false)
    reload()
  }

  async function handleRemove(id: string) {
    const result = await removeAddress(id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(t("account.addresses.removed"))
    reload()
  }

  async function handleSetDefault(id: string) {
    const result = await setDefaultAddress(id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(t("account.addresses.defaultUpdated"))
    reload()
  }

  const editingAddress = editingId ? addresses.find((a) => a.id === editingId) : undefined

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="max-sm:w-full">
          {t("account.addresses.add")}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPinOff}
          title={t("account.addresses.emptyTitle")}
          description={t("account.addresses.emptyText")}
          action={<Button onClick={openAdd}>{t("account.addresses.add")}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="space-y-3 rounded-card border border-border bg-surface p-4 shadow-soft sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink"
                >
                  <MapPin className="size-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-charcoal">
                    {a.full_name}
                    {a.is_default && <Badge variant="soft">{t("account.addresses.default")}</Badge>}
                  </p>
                  <p className="text-muted-text">{a.phone}</p>
                  <p className="text-muted-text">
                    {a.address}, {a.woreda}, {a.sub_city}, {cityLabel(a.city, t)}
                  </p>
                  {a.notes && <p className="text-muted-text">{t("account.addresses.notes", { notes: a.notes })}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("account.addresses.edit")}
                    onClick={() => openEdit(a.id)}
                    className="relative size-8 text-muted-text after:absolute after:-inset-1.5 hover:text-brand-ink"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("account.addresses.delete")}
                    onClick={() => handleRemove(a.id)}
                    className="relative size-8 text-muted-text after:absolute after:-inset-1.5 hover:text-brand-ink"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              </div>
              {!a.is_default && (
                <Button variant="outline" size="sm" onClick={() => handleSetDefault(a.id)} className="ml-[52px]">
                  {t("account.addresses.setDefault")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("account.addresses.edit") : t("account.addresses.add")}</DialogTitle>
          </DialogHeader>
          <AddressForm
            initialValues={editingAddress ? toFormValues(editingAddress) : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { AccountAddressesContent }
