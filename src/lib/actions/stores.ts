'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
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
const storeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50),
  type: z.enum(['Retail', 'Wholesale', 'Online', 'Service']),
  description: z.string().trim().max(200).optional().default(''),
})

export async function createStore(formData: {
  name: string
  type: StoreType
  description?: string
}) {
  // Fix (A7): validate server-side.
  const parsed = storeSchema.safeParse(formData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('stores')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description || null,
    })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/stores')
}


export async function updateStore(
  storeId: string,
  formData: { name: string; type: StoreType; description?: string }
) {
  if (!z.string().uuid().safeParse(storeId).success) {
    throw new Error('Invalid store')
  }
  // Fix (A7): validate server-side.
  const parsed = storeSchema.safeParse(formData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('stores')
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description || null,
    })
    .eq('id', storeId)
    .eq('user_id', user.id)   // ownership check

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath(`/store/${storeId}`)
}

export async function deleteStore(storeId: string) {
  if (!z.string().uuid().safeParse(storeId).success) {
    throw new Error('Invalid store')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', storeId)
    .eq('user_id', user.id)   // ownership check

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}