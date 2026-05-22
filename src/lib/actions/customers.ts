'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  initial_balance?: number
}) {
  await verifyStoreOwnership(formData.store_id)

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .insert({
      store_id: formData.store_id,
      name: formData.name,
      phone: formData.phone || null,
      address: formData.address || null,
      balance: formData.initial_balance ?? 0,
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${formData.store_id}`)
  revalidatePath('/customers')
  revalidatePath('/dashboard')
}

export async function updateCustomer(
  customerId: string,
  storeId: string,
  formData: { name: string; phone: string; address: string }
) {
  await verifyStoreOwnership(storeId)

  const supabase = await createClient()

  // Fix: verify customer belongs to this store before updating
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .eq('store_id', storeId)
    .single()

  if (!customer) throw new Error('Customer not found in this store')

  const { error } = await supabase
    .from('customers')
    .update({
      name: formData.name,
      phone: formData.phone || null,
      address: formData.address || null,
    })
    .eq('id', customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${storeId}`)
  revalidatePath('/customers')
}

export async function deleteCustomer(customerId: string, storeId: string) {
  await verifyStoreOwnership(storeId)

  const supabase = await createClient()

  // Fix: verify customer actually belongs to this store before deleting
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .eq('store_id', storeId)
    .single()

  if (!customer) throw new Error('Customer not found in this store')

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${storeId}`)
  revalidatePath('/customers')
  revalidatePath('/dashboard')
}

export async function getAllCustomers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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

  return data.map(c => ({
    ...c,
    storeName: stores.find(s => s.id === c.store_id)?.name ?? '',
  }))
}