'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCustomerTransactions(customerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('date', { ascending: false })

  if (error) { console.error(error); return [] }
  return data
}

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fix: verify customer belongs to a store owned by this user
  const { data: customer } = await supabase
    .from('customers')
    .select('store_id')
    .eq('id', formData.customer_id)
    .single()

  if (!customer) throw new Error('Customer not found')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', customer.store_id)
    .eq('user_id', user.id)
    .single()

  if (!store) throw new Error('Access denied')

  const { storeId, ...insertData } = formData

  const { error } = await supabase
    .from('transactions')
    .insert({
      ...insertData,
      date: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/store/${storeId}`)
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function addFullPayment(
  customerId: string,
  balance: number,
  storeId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fix: verify customer belongs to a store owned by this user
  const { data: customer } = await supabase
    .from('customers')
    .select('store_id')
    .eq('id', customerId)
    .single()

  if (!customer) throw new Error('Customer not found')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', customer.store_id)
    .eq('user_id', user.id)
    .single()

  if (!store) throw new Error('Access denied')

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