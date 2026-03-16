import Link from 'next/link'
import { Store, Users, TrendingDown, TrendingUp } from 'lucide-react'
import { formatCurrencyShort } from '@/lib/utils'
import type { Store as StoreType, Customer } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  Retail:    'bg-blue-50 text-blue-600',
  Wholesale: 'bg-green-50 text-green-600',
  Online:    'bg-purple-50 text-purple-600',
  Service:   'bg-orange-50 text-orange-600',
}

interface Props {
  store: StoreType
  customers: Customer[]
}

export default function StoreCard({ store, customers }: Props) {
  const due = customers
    .filter(c => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0)

  const advance = customers
    .filter(c => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0)

  return (
    <Link href={`/store/${store.id}`}>
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[store.type] ?? 'bg-slate-100 text-slate-600'}`}>
            {store.type}
          </span>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-slate-900 text-sm mb-0.5">
          {store.name}
        </h3>
        <p className="text-xs text-slate-400 mb-4 line-clamp-1">
          {store.description || 'No description'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>{customers.length} customers</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
              <TrendingDown className="w-3 h-3 text-red-400" />
              Due
            </div>
            <p className="text-sm font-semibold text-red-500">
              {formatCurrencyShort(due)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
              <TrendingUp className="w-3 h-3 text-green-400" />
              Advance
            </div>
            <p className="text-sm font-semibold text-green-500">
              {formatCurrencyShort(advance)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}