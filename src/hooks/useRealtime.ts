'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Realtime for customers in a specific store
export function useRealtimeStore(storeId: string | null) {
  const router = useRouter()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  useEffect(() => {
    if (!storeId) return

    const supabase = createClient()

    // Subscribe to customer balance changes in this store
    const customerChannel = supabase
      .channel(`store-customers-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          // When any customer changes — refresh the page data
          refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(customerChannel)
    }
  }, [storeId, refresh])
}

// Realtime for dashboard — watches all stores
export function useRealtimeDashboard(storeIds: string[]) {
  const router = useRouter()

  useEffect(() => {
    if (!storeIds.length) return

    const supabase = createClient()

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stores',
        },
        () => router.refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeIds.join(','), router])
}