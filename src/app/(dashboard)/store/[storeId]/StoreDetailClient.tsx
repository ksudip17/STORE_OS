'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatCurrency, cn } from '@/lib/utils'
import CustomerRow from '@/components/customer/CustomerRow'
import CustomerPanel from '@/components/customer/CustomerPanel'
import AddCustomerDialog from '@/components/customer/AddCustomerDialog'
import StatCard from '@/components/shared/StatCard'
import {
  ArrowLeft,
  Search,
  Users,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
} from 'lucide-react'
import type { Store, Customer, Transaction } from '@/lib/types'
import StoreActionsMenu from '@/components/store/StoreActionsMenu'


type BalanceFilter = 'all' | 'due' | 'advance' | 'clear'

interface Props {
  store: Store
  customers: Customer[]
  transactionsByCustomer: Record<string, Transaction[]>
}

export default function StoreDetailClient({
  store,
  customers,
  transactionsByCustomer,
}: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BalanceFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedCustomer = customers.find(c => c.id === selectedId) ?? null
  const selectedTx = selectedId ? (transactionsByCustomer[selectedId] ?? []) : []

  // Stats
  const totalDue = useMemo(() =>
    customers.filter(c => c.balance < 0)
      .reduce((s, c) => s + Math.abs(c.balance), 0),
    [customers]
  )
  const totalAdvance = useMemo(() =>
    customers.filter(c => c.balance > 0)
      .reduce((s, c) => s + c.balance, 0),
    [customers]
  )
  const totalTx = useMemo(() =>
    Object.values(transactionsByCustomer).flat().length,
    [transactionsByCustomer]
  )

  // Filter + search
  const filtered = useMemo(() => {
    let list = [...customers]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      )
    }
    if (filter === 'due')     list = list.filter(c => c.balance < 0)
    if (filter === 'advance') list = list.filter(c => c.balance > 0)
    if (filter === 'clear')   list = list.filter(c => c.balance === 0)
    return list
  }, [customers, search, filter])

  const filterTabs: { key: BalanceFilter; label: string }[] = [
    { key: 'all',     label: `All (${customers.length})` },
    { key: 'due',     label: `Due (${customers.filter(c => c.balance < 0).length})` },
    { key: 'advance', label: `Advance (${customers.filter(c => c.balance > 0).length})` },
    { key: 'clear',   label: `Clear (${customers.filter(c => c.balance === 0).length})` },
  ]

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <Link
      href="/dashboard"
      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <ArrowLeft className="w-4 h-4 text-slate-500" />
    </Link>
    <div>
      <h1 className="text-base font-semibold text-slate-900">
        {store.name}
      </h1>
      <p className="text-xs text-slate-400">{store.type}</p>
    </div>
    {/* ← Add this */}
    <StoreActionsMenu store={store} />
  </div>
  <AddCustomerDialog storeId={store.id} />
</div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
        <StatCard
          label="Customers"
          value={customers.length}
          icon={Users}
        />
        <StatCard
          label="Total Due"
          value={totalDue}
          icon={TrendingDown}
          variant="danger"
          isCurrency
        />
        <StatCard
          label="Total Advance"
          value={totalAdvance}
          icon={TrendingUp}
          variant="success"
          isCurrency
        />
        <StatCard
          label="Transactions"
          value={totalTx}
          icon={ArrowLeftRight}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — customer list */}
        <div className={cn(
          'flex flex-col border-r border-slate-200 bg-white transition-all',
          selectedCustomer ? 'w-[420px] shrink-0' : 'flex-1'
        )}>
          {/* Search + filters */}
          <div className="px-4 pt-3 pb-2 border-b border-slate-100">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    filter === tab.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-slate-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Users className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">
                  {search || filter !== 'all'
                    ? 'No customers match your filter'
                    : 'No customers yet'}
                </p>
                {!search && filter === 'all' && (
                  <p className="text-slate-400 text-xs mt-1">
                    Add your first customer to get started
                  </p>
                )}
              </div>
            ) : (
              filtered.map(customer => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  isSelected={customer.id === selectedId}
                  onClick={() =>
                    setSelectedId(
                      customer.id === selectedId ? null : customer.id
                    )
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Right — customer detail panel */}
        {selectedCustomer && (
          <div className="flex-1 overflow-hidden">
            <CustomerPanel
              customer={selectedCustomer}
              transactions={selectedTx}
              storeId={store.id}
              store={store}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}

        {/* Empty state when no customer selected */}
        {!selectedCustomer && customers.length > 0 && (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50">
            <div className="text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                Select a customer to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}