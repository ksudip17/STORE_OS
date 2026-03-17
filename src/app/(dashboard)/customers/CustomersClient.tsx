'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatCurrency, getInitials, cn } from '@/lib/utils'
import { Search, Users, TrendingDown, TrendingUp, Store, ArrowUpRight } from 'lucide-react'
import type { Customer, Store as StoreType } from '@/lib/types'

type BalanceFilter = 'all' | 'due' | 'advance' | 'clear'

interface CustomerWithStore extends Customer {
  storeName: string
}

interface Props {
  customers: CustomerWithStore[]
  stores: StoreType[]
}

export default function CustomersClient({ customers, stores }: Props) {
  const [search, setSearch]         = useState('')
  const [balFilter, setBalFilter]   = useState<BalanceFilter>('all')
  const [storeFilter, setStoreFilter] = useState<string>('all')

  const totalDue = useMemo(() =>
    customers.filter(c => c.balance < 0)
      .reduce((s, c) => s + Math.abs(c.balance), 0), [customers])

  const totalAdvance = useMemo(() =>
    customers.filter(c => c.balance > 0)
      .reduce((s, c) => s + c.balance, 0), [customers])

  const filtered = useMemo(() => {
    let list = [...customers]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.storeName.toLowerCase().includes(q)
      )
    }
    if (storeFilter !== 'all')  list = list.filter(c => c.store_id === storeFilter)
    if (balFilter === 'due')    list = list.filter(c => c.balance < 0)
    if (balFilter === 'advance')list = list.filter(c => c.balance > 0)
    if (balFilter === 'clear')  list = list.filter(c => c.balance === 0)

    return list
  }, [customers, search, balFilter, storeFilter])

  const balTabs: { key: BalanceFilter; label: string }[] = [
    { key: 'all',     label: `All (${customers.length})` },
    { key: 'due',     label: `Due (${customers.filter(c => c.balance < 0).length})` },
    { key: 'advance', label: `Advance (${customers.filter(c => c.balance > 0).length})` },
    { key: 'clear',   label: `Clear (${customers.filter(c => c.balance === 0).length})` },
  ]

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              All customers across your stores
            </p>
          </div>
        </div>

        {/* Summary row */}
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 font-medium">{customers.length}</span>
            <span className="text-slate-400">total</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-red-500 font-medium">{formatCurrency(totalDue)}</span>
            <span className="text-slate-400">due</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-500 font-medium">{formatCurrency(totalAdvance)}</span>
            <span className="text-slate-400">advance</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone or store..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center justify-between gap-4">
          {/* Balance filter tabs */}
          <div className="flex gap-1">
            {balTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setBalFilter(tab.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  balFilter === tab.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Store filter dropdown */}
          <select
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stores</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <div className="col-span-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</div>
          <div className="col-span-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</div>
          <div className="col-span-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Store</div>
          <div className="col-span-2 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Balance</div>
          <div className="col-span-1 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Action</div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Users className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No customers found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || balFilter !== 'all' || storeFilter !== 'all'
                ? 'Try changing your filters'
                : 'Add customers from the store page'}
            </p>
          </div>
        ) : (
          filtered.map(customer => {
            const isDue     = customer.balance < 0
            const isAdvance = customer.balance > 0
            const isClear   = customer.balance === 0

            return (
              <div
                key={customer.id}
                className="grid grid-cols-12 px-6 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center"
              >
                {/* Name + avatar */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-slate-600">
                      {getInitials(customer.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {customer.name}
                    </p>
                    {customer.address && (
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">
                        {customer.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="col-span-3 text-sm text-slate-500">
                  {customer.phone || '—'}
                </div>

                {/* Store */}
                <div className="col-span-2 flex items-center gap-1.5">
                  <Store className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">
                    {customer.storeName}
                  </span>
                </div>

                {/* Balance */}
                <div className="col-span-2 text-right">
                  <p className={cn(
                    'text-sm font-semibold',
                    isDue     && 'text-red-500',
                    isAdvance && 'text-green-500',
                    isClear   && 'text-slate-400',
                  )}>
                    {isClear ? '—' : formatCurrency(customer.balance)}
                  </p>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-medium',
                    isDue     && 'bg-red-50 text-red-500',
                    isAdvance && 'bg-green-50 text-green-500',
                    isClear   && 'bg-slate-100 text-slate-400',
                  )}>
                    {isDue ? 'Due' : isAdvance ? 'Advance' : 'Clear'}
                  </span>
                </div>

                {/* Action — go to store page */}
                <div className="col-span-1 flex justify-end">
                  <Link
                    href={`/store/${customer.store_id}`}
                    className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Go to store"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div className="px-6 py-2.5 bg-white border-t border-slate-100 shrink-0">
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {customers.length} customers
          </p>
        </div>
      )}
    </div>
  )
}