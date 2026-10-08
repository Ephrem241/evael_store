"use client"

import { useRemote, type Remote } from "@/lib/hooks/use-remote"
import { fetchAdminCategories, fetchAdminProduct, fetchAdminProducts } from "@/lib/services/admin-catalog"
import { fetchProfiles, type AdminProfile } from "@/lib/services/admin-customers"
import { fetchHomepageSettings } from "@/lib/services/admin-homepage"
import { fetchStoreContactSettings, type StoreContactSettings } from "@/lib/services/admin-store-settings"
import {
  countUnreadMessages,
  fetchContactMessage,
  fetchContactMessages,
  type ContactMessage,
} from "@/lib/services/admin-messages"
import type { HomepageSettings } from "@/lib/services/homepage"
import type { Product } from "@/lib/data/products"
import type { Category } from "@/lib/data/categories"

// Admin views load everything under one fixed key. RLS decides what the
// caller actually receives, so a non-admin who somehow reached these hooks
// would get only what they're allowed to see.
const loadProducts = () => fetchAdminProducts()
const loadCategories = () => fetchAdminCategories()
const loadProfiles = () => fetchProfiles()

// `enabled: false` loads nothing yet (the admin search waits until it is used).
export function useAdminProducts(enabled = true): Remote<Product[]> {
  return useRemote(enabled ? "all" : null, loadProducts)
}

const loadProduct = (id: string) => fetchAdminProduct(id)

// `data` is `null` when there is no such product.
export function useAdminProduct(id: string): Remote<Product | null> {
  return useRemote(id, loadProduct)
}

export function useAdminCategories(): Remote<Category[]> {
  return useRemote("all", loadCategories)
}

const loadHomepage = () => fetchHomepageSettings()

export function useHomepageSettings(): Remote<HomepageSettings> {
  return useRemote("homepage", loadHomepage)
}

const loadStoreSettings = () => fetchStoreContactSettings()

export function useStoreContactSettings(): Remote<StoreContactSettings> {
  return useRemote("store-settings", loadStoreSettings)
}

export function useProfiles(enabled = true): Remote<AdminProfile[]> {
  return useRemote(enabled ? "all" : null, loadProfiles)
}

const loadMessages = () => fetchContactMessages()
const loadMessage = (id: string) => fetchContactMessage(id)
const loadUnreadCount = () => countUnreadMessages()

export function useContactMessages(): Remote<ContactMessage[]> {
  return useRemote("all", loadMessages)
}

// `data` is `null` when there is no such message.
export function useContactMessage(id: string): Remote<ContactMessage | null> {
  return useRemote(id, loadMessage)
}

export function useUnreadMessageCount(enabled = true): Remote<number> {
  return useRemote(enabled ? "unread" : null, loadUnreadCount)
}
