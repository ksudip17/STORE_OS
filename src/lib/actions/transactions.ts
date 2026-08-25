'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Shared ownership helper ---------------------------------------------
// Verifies the caller is authenticated AND that a given customer belongs
// to a store owned by the caller. Returns the supabase client + user or
// throws. Prevents IDOR on every transaction-level action.
async function requireCustomerOwnership(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('store_id')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) throw new Error('Customer not found')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', customer.store_id)
    .eq('user_id', user.id)
    .single()

  if (!store) throw new Error('Access denied')

  return { supabase, user, storeId: store.id }
}

export async function getCustomerTransactions(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Fix (IDOR): verify this customer belongs to a store owned by the caller
  // before returning any transaction data.
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('store_id')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) return []

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', customer.store_id)
    .eq('user_id', user.id)
    .single()

  if (!store) return []

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('date', { ascending: false })

  if (error) { console.error(error); return [] }
  return data
}

// Batch-fetch transactions for a set of customers that are guaranteed to
// belong to the caller's stores. Avoids the N+1 query loop.
export async function getTransactionsForCustomers(customerIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || customerIds.length === 0) return []

  const { data: customers } = await supabase
    .from('customers')
    .select('id, store_id')
    .in('id', customerIds)

  if (!customers?.length) return []

  const { data: stores } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)

  const ownedStoreIds = new Set((stores ?? []).map(s => s.id))
  const safeIds = customers
    .filter(c => ownedStoreIds.has(c.store_id))
    .map(c => c.id)

  if (safeIds.length === 0) return []

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .in('customer_id', safeIds)
    .order('date', { ascending: false })

  if (error) { console.error(error); return [] }
  return data
}

const transactionSchema = z.object({
  customer_id: z.string().uuid(),
  type: z.enum(['sale', 'payment']),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(300).optional().nullable(),
  product: z.string().max(150).optional().nullable(),
  quantity: z.number().positive().optional().nullable(),
  rate: z.number().positive().optional().nullable(),
  storeId: z.string().uuid(),
})

export async function addTransaction(formData: {
  customer_id: string
  type: 'sale' | 'payment'
  amount: number
  description?: string
  product?: string
  quantity?: number
  rate?: number
  storeId: string
}) {
  // Fix (A7): server-side validation — never trust the client.
  const parsed = transactionSchema.safeParse(formData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input')
  }
  const { storeId, ...insertData } = parsed.data

  const { supabase, storeId: ownedStoreId } =
    await requireCustomerOwnership(parsed.data.customer_id)

  // Double-check the storeId supplied by the client matches the one the
  // customer actually belongs to (prevents writing to the wrong store).
  if (storeId !== ownedStoreId) throw new Error('Access denied')

  const { error } = await supabase
    .from('transactions')
    .insert({
      ...insertData,
      date: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${ownedStoreId}`)
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function addFullPayment(customerId: string) {
  // Fix (A8): ignore the client-supplied balance/storeId entirely and use the
  // authoritative balance + ownership resolved from the database.
  const { supabase, storeId } = await requireCustomerOwnership(customerId)

  const { data: customer } = await supabase
    .from('customers')
    .select('balance')
    .eq('id', customerId)
    .single()

  const balance = customer?.balance ?? 0
  if (balance >= 0) {
    // Nothing outstanding — nothing to clear.
    revalidatePath(`/store/${storeId}`)
    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return
  }

  const amount = Math.abs(balance)

  const { error } = await supabase
    .from('transactions')
    .insert({
      customer_id: customerId,
      type: 'payment',
      amount,
      description: 'Full payment — balance cleared',
      date: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${storeId}`)
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}
