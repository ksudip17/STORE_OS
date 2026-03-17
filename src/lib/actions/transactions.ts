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

  const { storeId, ...insertData } = formData

  const { error } = await supabase
    .from('transactions')
    .insert({
      ...insertData,
      date: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)

  // Revalidate both store page and dashboard
  revalidatePath(`/store/${storeId}`)
  revalidatePath('/dashboard')
}

export async function addFullPayment(
  customerId: string,
  balance: number,
  storeId: string
) {
  const supabase = await createClient()

  // balance is negative for due, so abs it
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
}