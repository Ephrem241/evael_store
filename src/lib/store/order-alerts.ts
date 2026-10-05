import { create } from "zustand"
import { persist } from "zustand/middleware"

import { fetchUnseenOrders, markOrdersSeen, type OrderAlert } from "@/lib/services/admin-order-alerts"

// The admin panel's new-order alerts, shared by the watcher (which polls), the
// bell, the Orders nav badge and the orders list — so they always agree.
// Only `soundOn` is remembered (per browser); the orders always come from the
// database.
interface OrderAlertsState {
  unseen: OrderAlert[]
  /** False until the first successful poll. */
  loaded: boolean
  soundOn: boolean
  refresh: () => Promise<OrderAlert[] | null>
  markSeen: (ids?: string[]) => Promise<{ success: true } | { success: false; error: string }>
  setSoundOn: (on: boolean) => void
}

export const useOrderAlertsStore = create<OrderAlertsState>()(
  persist(
    (set, get) => ({
      unseen: [],
      loaded: false,
      soundOn: true,

      refresh: async () => {
        try {
          const unseen = await fetchUnseenOrders()
          set({ unseen, loaded: true })
          return unseen
        } catch (error) {
          // A failed poll keeps what we had; the next one tries again.
          console.error(error)
          return null
        }
      },

      // Optimistic: the badge drops at once; on failure the next refresh
      // restores the truth.
      markSeen: async (ids) => {
        const before = get().unseen
        // Nothing to do for orders already seen — once we know which those are.
        if (ids && get().loaded && !before.some((order) => ids.includes(order.id))) return { success: true }
        set({ unseen: ids ? before.filter((order) => !ids.includes(order.id)) : [] })
        const result = await markOrdersSeen(ids)
        if (!result.success) void get().refresh()
        return result
      },

      setSoundOn: (soundOn) => set({ soundOn }),
    }),
    {
      name: "evael-admin-order-alerts",
      partialize: (state) => ({ soundOn: state.soundOn }),
    }
  )
)
