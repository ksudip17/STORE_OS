import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStores, getCustomers } from '@/lib/actions/stores'
import StoreCard from '@/components/store/StoreCard'
import AddStoreDialog from '@/components/store/AddStoreDialog'
import { Store } from 'lucide-react'

export default async function StoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [stores, customers] = await Promise.all([
    getStores(),
    getCustomers(),
  ])

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Stores</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stores.length} store{stores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddStoreDialog />
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-slate-200 rounded-xl">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <Store className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-slate-500 font-medium text-sm mb-1">No stores yet</p>
          <p className="text-slate-400 text-xs mb-5">
            Create your first store to start tracking customers and credit.
          </p>
          <AddStoreDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              customers={customers.filter(c => c.store_id === store.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
