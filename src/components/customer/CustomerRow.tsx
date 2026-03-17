'use client'

import { cn, formatCurrency, getInitials } from '@/lib/utils'
import type { Customer } from '@/lib/types'

interface Props {
  customer: Customer
  isSelected: boolean
  onClick: () => void
}

export default function CustomerRow({ customer, isSelected, onClick }: Props) {
  const isDue     = customer.balance < 0
  const isAdvance = customer.balance > 0
  const isClear   = customer.balance === 0

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-0',
        isSelected
          ? 'bg-blue-50'
          : 'hover:bg-slate-50'
      )}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-medium text-slate-600">
          {getInitials(customer.name)}
        </span>
      </div>

      {/* Name + phone */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {customer.name}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {customer.phone || 'No phone'}
        </p>
      </div>

      {/* Balance badge */}
      <div className="text-right shrink-0">
        <p className={cn(
          'text-sm font-semibold',
          isDue     && 'text-red-500',
          isAdvance && 'text-green-500',
          isClear   && 'text-slate-400',
        )}>
          {isClear ? 'Clear' : formatCurrency(customer.balance)}
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
    </div>
  )
}