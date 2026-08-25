'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function verifyStoreOwnership(storeId: string) {
  if (!z.string().uuid().safeParse(storeId).success) {
    throw new Error('Invalid store')
  }
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

const createCustomerSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().trim().max(20).optional().default(''),
  address: z.string().trim().max(200).optional().default(''),
  initial_balance: z.number().finite().min(-100000000).max(100000000).optional().default(0),
})

export async function createCustomer(formData: {
  store_id: string
  name: string
  phone: string
  address: string
  initial_balance?: number
}) {
  // Fix (A7): validate server-side.
  const parsed = createCustomerSchema.safeParse(formData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }
  const { store_id, name, phone, address, initial_balance } = parsed.data

  await verifyStoreOwnership(store_id)

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .insert({
      store_id,
      name,
      phone: phone || null,
      address: address || null,
      balance: initial_balance,
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${store_id}`)
  revalidatePath('/customers')
  revalidatePath('/dashboard')
}

const updateCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().trim().max(20).optional().default(''),
  address: z.string().trim().max(200).optional().default(''),
})

export async function updateCustomer(
  customerId: string,
  storeId: string,
  formData: { name: string; phone: string; address: string }
) {
  // Fix (A7): validate server-side.
  const parsed = updateCustomerSchema.safeParse(formData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

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
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
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