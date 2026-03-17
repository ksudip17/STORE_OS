'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper — verify store belongs to current user
async function verifyStoreOwnership(storeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('user_id', user.id)
    .single()

  if (!store) throw new Error('Store not found or access denied')
  return { supabase, user }
}

export async function getStoreCustomers(storeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // RLS handles this, but we also verify store ownership explicitly
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('user_id', user.id)
    .single()

  if (!store) return []

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true })

  if (error) { console.error(error); return [] }
  return data
}

export async function createCustomer(formData: {
  store_id: string
  name: string
  phone: string
  address: string
}) {
  // Verify store belongs to user before inserting
  await verifyStoreOwnership(formData.store_id)

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .insert({
      store_id: formData.store_id,
      name: formData.name,
      phone: formData.phone || null,
      address: formData.address || null,
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${formData.store_id}`)
  revalidatePath('/customers')
  revalidatePath('/dashboard')
}

export async function deleteCustomer(customerId: string, storeId: string) {
  // Verify store ownership before deleting
  await verifyStoreOwnership(storeId)

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${storeId}`)
  revalidatePath('/customers')
  revalidatePath('/dashboard')
}

// Get ALL customers across all stores for a user
export async function getAllCustomers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get user's store IDs first
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', user.id)

  if (!stores?.length) return []

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .in('store_id', stores.map(s => s.id))
    .order('name', { ascending: true })

  if (error) { console.error(error); return [] }

  // Attach store name to each customer
  return data.map(c => ({
    ...c,
    storeName: stores.find(s => s.id === c.store_id)?.name ?? '',
  }))
}