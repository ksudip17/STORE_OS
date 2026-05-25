import { getStores, getCustomers } from '@/lib/actions/stores'
import StatCard from '@/components/shared/StatCard'
import StoreCard from '@/components/store/StoreCard'
import DashboardRealtime from './DashboardClient'
import DashboardHeader from './DashboardHeader'
import DashboardEmptyState from './DashboardEmptyState'
import { Users, TrendingDown, TrendingUp, Store } from 'lucide-react'

export default async function DashboardPage() {
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
    <DashboardRealtime storeIds={stores.map(s => s.id)}>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">

        <DashboardHeader
          storeCount={stores.length}
          customerCount={customers.length}
        />

        {/* Stats — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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

        {/* Stores */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">
            My Stores
          </h2>
          {stores.length === 0 ? (
            <DashboardEmptyState />
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

      </div>
    </DashboardRealtime>
  )
}