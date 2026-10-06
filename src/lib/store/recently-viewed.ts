import { create } from "zustand"
import { persist } from "zustand/middleware"

// The products this browser opened most recently, newest first — for the
// "Recently viewed" row on product pages. Only ids are kept; the products
// themselves are looked up live when the row is shown (so a price or stock
// change is never stale, and a removed product simply drops out).
interface RecentlyViewedState {
  ids: string[]
  record: (id: string) => void
}

const MAX_RECENT = 12

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      record: (id) =>
        set((state) =>
          state.ids[0] === id ? state : { ids: [id, ...state.ids.filter((x) => x !== id)].slice(0, MAX_RECENT) }
        ),
    }),
    { name: "evael-recently-viewed" }
  )
)
