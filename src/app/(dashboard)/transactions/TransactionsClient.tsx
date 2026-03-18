'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import {
  MonthlyBarChart,
  TopDueChart,
  DistributionPieChart,
} from '@/components/shared/AnalyticsCharts'
import {
  Search,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  BarChart2,
} from 'lucide-react'

type Tab       = 'transactions' | 'analytics'
type TxFilter  = 'all' | 'sale' | 'payment'
type SortField = 'date' | 'amount' | 'customer'
type SortDir   = 'asc' | 'desc'

interface Transaction {
  id: string
  customer_id: string
  customerName: string
  customerPhone: string
  storeName: string
  storeId: string
  type: 'sale' | 'payment'
  amount: number
  product: string | null
  description: string | null
  quantity: number | null
  rate: number | null
  date: string
}

interface Analytics {
  monthlyData: any[]
  topDue: any[]
  distribution: any[]
  totalTransactions: number
  totalSales: number
  totalCollected: number
}

interface Props {
  transactions: Transaction[]
  analytics: Analytics | null
}

export default function TransactionsClient({ transactions, analytics }: Props) {
  const [tab, setTab]           = useState<Tab>('transactions')
  const [search, setSearch]     = useState('')
  const [typeFilter, setFilter] = useState<TxFilter>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir]   = useState<SortDir>('desc')

  const totalSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((s, t) => s + t.amount, 0)

  const totalPayments = transactions
    .filter(t => t.type === 'payment')
    .reduce((s, t) => s + t.amount, 0)

  const filtered = useMemo(() => {
    let list = [...transactions]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.customerName.toLowerCase().includes(q) ||
        t.storeName.toLowerCase().includes(q) ||
        t.product?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    }

    if (typeFilter !== 'all') {
      list = list.filter(t => t.type === typeFilter)
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortField === 'date')     cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortField === 'amount')   cmp = a.amount - b.amount
      if (sortField === 'customer') cmp = a.customerName.localeCompare(b.customerName)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [transactions, search, typeFilter, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Transactions
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {transactions.length} total entries
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700">{transactions.length}</span>
            <span className="text-slate-400">transactions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="font-medium text-red-500">
              {formatCurrency(totalSales)}
            </span>
            <span className="text-slate-400">total sales</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="font-medium text-green-500">
              {formatCurrency(totalPayments)}
            </span>
            <span className="text-slate-400">collected</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {([
            { key: 'transactions', label: 'All Transactions', icon: ArrowLeftRight },
            { key: 'analytics',    label: 'Analytics',        icon: BarChart2 },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'analytics' ? (
        <div className="flex-1 overflow-y-auto p-6">
          {!analytics ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">No data yet — add transactions first</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-5xl mx-auto">
              {/* Top stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-sm text-slate-500 mb-1">Total Transactions</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {analytics.totalTransactions}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-sm text-slate-500 mb-1">Total Sales Value</p>
                  <p className="text-2xl font-semibold text-red-500">
                    {formatCurrency(analytics.totalSales)}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-sm text-slate-500 mb-1">Total Collected</p>
                  <p className="text-2xl font-semibold text-green-500">
                    {formatCurrency(analytics.totalCollected)}
                  </p>
                </div>
              </div>

              {/* Monthly bar chart — full width */}
              <MonthlyBarChart data={analytics.monthlyData} />

              {/* Bottom two charts */}
              <div className="grid grid-cols-2 gap-4">
                <TopDueChart data={analytics.topDue} />
                <DistributionPieChart data={analytics.distribution} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-1">
              {(['all', 'sale', 'payment'] as TxFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                    typeFilter === f
                      ? f === 'sale'
                        ? 'bg-red-50 text-red-600'
                        : f === 'payment'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-slate-50'
                  )}
                >
                  {f === 'all' ? `All (${transactions.length})` : f}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 ml-auto">
              {filtered.length} results
            </p>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* Table header */}
            <div className="grid grid-cols-12 px-6 py-2.5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              {[
                { label: 'Customer',    field: 'customer' as SortField, span: 3 },
                { label: 'Store',       field: null,                     span: 2 },
                { label: 'Product',     field: null,                     span: 2 },
                { label: 'Date',        field: 'date' as SortField,      span: 2 },
                { label: 'Amount',      field: 'amount' as SortField,    span: 2 },
                { label: 'Type',        field: null,                     span: 1 },
              ].map(col => (
                <div
                  key={col.label}
                  className={cn(
                    `col-span-${col.span} flex items-center gap-1`,
                    col.field && 'cursor-pointer hover:text-slate-700'
                  )}
                  onClick={() => col.field && toggleSort(col.field)}
                >
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {col.label}
                  </span>
                  {col.field && (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <ArrowLeftRight className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No transactions found</p>
                <p className="text-slate-400 text-sm mt-1">
                  Try changing your search or filters
                </p>
              </div>
            ) : (
              filtered.map(tx => (
                <div
                  key={tx.id}
                  className="grid grid-cols-12 px-6 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center"
                >
                  {/* Customer */}
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-slate-500">
                        {getInitials(tx.customerName)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {tx.customerName}
                      </p>
                      {tx.customerPhone && (
                        <p className="text-xs text-slate-400">{tx.customerPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Store */}
                  <div className="col-span-2 text-sm text-slate-500 truncate">
                    {tx.storeName}
                  </div>

                  {/* Product */}
                  <div className="col-span-2 text-sm text-slate-500 truncate">
                    {tx.product || tx.description || '—'}
                    {tx.quantity && tx.rate && (
                      <p className="text-xs text-slate-400">
                        {tx.quantity} × ₹{tx.rate}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-slate-500">
                    {format(new Date(tx.date), 'dd MMM yyyy')}
                    <p className="text-xs text-slate-400">
                      {format(new Date(tx.date), 'hh:mm a')}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <p className={cn(
                      'text-sm font-semibold',
                      tx.type === 'sale' ? 'text-red-500' : 'text-green-500'
                    )}>
                      {tx.type === 'sale' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>

                  {/* Type badge */}
                  <div className="col-span-1">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      tx.type === 'sale'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-green-50 text-green-500'
                    )}>
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-6 py-2.5 bg-white border-t border-slate-100 shrink-0">
              <p className="text-xs text-slate-400">
                Showing {filtered.length} of {transactions.length} transactions
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}