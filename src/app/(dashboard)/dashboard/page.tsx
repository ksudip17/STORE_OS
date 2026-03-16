import { getStores, getCustomers } from '@/lib/actions/stores'
import StatCard from '@/components/shared/StatCard'
import StoreCard from '@/components/store/StoreCard'
import AddStoreDialog from '@/components/store/AddStoreDialog'
import { Store, Users, TrendingDown, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  // Server-side data fetch — no useEffect needed
  const [stores, customers] = await Promise.all([
    getStores(),
    getCustomers(),
  ])

  const totalDue = customers
    .filter(c => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0)

  const totalAdvance = customers
    .filter(c => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stores.length} store{stores.length !== 1 ? 's' : ''} · {customers.length} customers
          </p>
        </div>
        <AddStoreDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Stores"
          value={stores.length}
          icon={Store}
          trend="Active stores"
        />
        <StatCard
          label="Total Customers"
          value={customers.length}
          icon={Users}
          trend="Across all stores"
        />
        <StatCard
          label="Total Due"
          value={totalDue}
          icon={TrendingDown}
          variant="danger"
          isCurrency
          trend="Outstanding balance"
        />
        <StatCard
          label="Total Advance"
          value={totalAdvance}
          icon={TrendingUp}
          variant="success"
          isCurrency
          trend="Credit balance"
        />
      </div>

      {/* Stores grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">My Stores</h2>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
            <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No stores yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              Create your first store to get started
            </p>
            <AddStoreDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  )
}