import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStoreCustomers } from '@/lib/actions/customers'
import { getCustomerTransactions } from '@/lib/actions/transactions'
import StoreDetailClient from './StoreDetailClient'

interface Props {
  params: Promise<{ storeId: string }>
}

export default async function StoreDetailPage({ params }: Props) {
  const { storeId } = await params
  const supabase = await createClient()

  // Get authenticated user first
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Fetch store AND verify it belongs to this user in one query
  // If storeId belongs to another user, RLS returns null → notFound()
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .eq('user_id', user.id)   // ← explicit ownership check
    .single()

  // If store doesn't exist OR belongs to another user → 404
  if (!store) notFound()

  const customers = await getStoreCustomers(storeId)

  const transactionsByCustomer: Record<string, any[]> = {}
  await Promise.all(
    customers.map(async (c) => {
      transactionsByCustomer[c.id] = await getCustomerTransactions(c.id)
    })
  )

  return (
    <StoreDetailClient
      store={store}
      customers={customers}
      transactionsByCustomer={transactionsByCustomer}
    />
  )
}