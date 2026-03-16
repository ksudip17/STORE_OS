'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { StoreType } from '@/lib/types'

// Fetch all stores for current user
export async function getStores() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return data
}

// Fetch all customers for current user (across all stores)
export async function getCustomers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const stores = await getStores()
  if (!stores.length) return []

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .in('store_id', stores.map(s => s.id))
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return data
}

// Create a new store
export async function createStore(formData: {
  name: string
  type: StoreType
  description: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('stores')
    .insert({
      user_id: user.id,
      name: formData.name,
      type: formData.type,
      description: formData.description || null,
    })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/stores')
}

// Delete a store
export async function deleteStore(storeId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', storeId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/stores')
}