'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAllTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get all store IDs for this user
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', user.id)

  if (!stores?.length) return []

  // Get all customers in those stores
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, store_id')
    .in('store_id', stores.map(s => s.id))

  if (!customers?.length) return []

  // Get all transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .in('customer_id', customers.map(c => c.id))
    .order('date', { ascending: false })

  if (error) { console.error(error); return [] }

  // Join customer and store data
  return transactions.map(tx => ({
    ...tx,
    customerName: customers.find(c => c.id === tx.customer_id)?.name ?? '—',
    customerPhone: customers.find(c => c.id === tx.customer_id)?.phone ?? '',
    storeId: customers.find(c => c.id === tx.customer_id)?.store_id ?? '',
    storeName: stores.find(s =>
      s.id === customers.find(c => c.id === tx.customer_id)?.store_id
    )?.name ?? '—',
  }))
}

export async function getAnalyticsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', user.id)

  if (!stores?.length) return null

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, balance, store_id')
    .in('store_id', stores.map(s => s.id))

  if (!customers?.length) return null

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('customer_id', customers.map(c => c.id))
    .order('date', { ascending: true })

  // Build last 6 months data
  const months: {
    month: string
    sales: number
    payments: number
    net: number
  }[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = date.getMonth()
    const label = date.toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    })

    const monthTx = (transactions ?? []).filter(tx => {
      const d = new Date(tx.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

    const sales = monthTx
      .filter(tx => tx.type === 'sale')
      .reduce((s, tx) => s + tx.amount, 0)

    const payments = monthTx
      .filter(tx => tx.type === 'payment')
      .reduce((s, tx) => s + tx.amount, 0)

    months.push({ month: label, sales, payments, net: sales - payments })
  }

  // Top 5 customers by due
  const topDue = [...(customers ?? [])]
    .filter(c => c.balance < 0)
    .sort((a, b) => a.balance - b.balance)
    .slice(0, 5)
    .map(c => ({
      name: c.name,
      due: Math.abs(c.balance),
    }))

  // Balance distribution
  const dueCount     = customers?.filter(c => c.balance < 0).length ?? 0
  const advanceCount = customers?.filter(c => c.balance > 0).length ?? 0
  const clearCount   = customers?.filter(c => c.balance === 0).length ?? 0

  return {
    monthlyData: months,
    topDue,
    distribution: [
      { name: 'Due',     value: dueCount,     color: '#ef4444' },
      { name: 'Advance', value: advanceCount,  color: '#22c55e' },
      { name: 'Clear',   value: clearCount,    color: '#94a3b8' },
    ],
    totalTransactions: transactions?.length ?? 0,
    totalSales: transactions
      ?.filter(t => t.type === 'sale')
      .reduce((s, t) => s + t.amount, 0) ?? 0,
    totalCollected: transactions
      ?.filter(t => t.type === 'payment')
      .reduce((s, t) => s + t.amount, 0) ?? 0,
  }
}