'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeStore(storeId: string | null) {
  const router = useRouter()

  useEffect(() => {
    if (!storeId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`store-customers-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `store_id=eq.${storeId}`,
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        () => router.refresh()
      )
      .subscribe()

    // Fix: proper cleanup on unmount prevents memory leaks
    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, router])
}

export function useRealtimeDashboard(storeIds: string[]) {
  const router = useRouter()

  // Fix: stable primitive — prevents duplicate subscriptions on array reference change
  const storeKey = storeIds.join(',')

  useEffect(() => {
    if (!storeKey) return

    const supabase = createClient()

    const channel = supabase
      .channel(`dashboard-${storeKey}`)
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

    // Fix: cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeKey, router])
}