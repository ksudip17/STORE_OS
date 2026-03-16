import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Store, Customer, Transaction, Profile } from './types'

interface AppState {
  // Data
  profile: Profile | null
  stores: Store[]
  customers: Customer[]
  transactions: Transaction[]

  // UI state
  activeStoreId: string | null
  selectedCustomerId: string | null
  isLoading: boolean

  // Actions
  setProfile: (p: Profile | null) => void
  setStores: (s: Store[]) => void
  setCustomers: (c: Customer[]) => void
  setTransactions: (t: Transaction[]) => void
  setActiveStore: (id: string | null) => void
  setSelectedCustomer: (id: string | null) => void
  setLoading: (v: boolean) => void

  // Derived helpers
  getStoreCustomers: (storeId: string) => Customer[]
  getCustomerTransactions: (customerId: string) => Transaction[]
  getTotalDue: () => number
  getTotalAdvance: () => number
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      stores: [],
      customers: [],
      transactions: [],
      activeStoreId: null,
      selectedCustomerId: null,
      isLoading: false,

      setProfile: (profile) => set({ profile }),
      setStores: (stores) => set({ stores }),
      setCustomers: (customers) => set({ customers }),
      setTransactions: (transactions) => set({ transactions }),
      setActiveStore: (activeStoreId) => set({ activeStoreId }),
      setSelectedCustomer: (selectedCustomerId) => set({ selectedCustomerId }),
      setLoading: (isLoading) => set({ isLoading }),

      getStoreCustomers: (storeId) =>
        get().customers.filter(c => c.store_id === storeId),

      getCustomerTransactions: (customerId) =>
        get().transactions.filter(t => t.customer_id === customerId),

      getTotalDue: () =>
        get().customers
          .filter(c => c.balance < 0)
          .reduce((sum, c) => sum + Math.abs(c.balance), 0),

      getTotalAdvance: () =>
        get().customers
          .filter(c => c.balance > 0)
          .reduce((sum, c) => sum + c.balance, 0),
    }),
    {
      name: 'store-os',
      storage: createJSONStorage(() => localStorage),
      // Only persist UI state, not data (data comes from Supabase)
      partialize: (state) => ({
        activeStoreId: state.activeStoreId,
      }),
    }
  )
)