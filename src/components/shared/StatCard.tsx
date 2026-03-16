import { cn, formatCurrency } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number | string
  icon: LucideIcon
  trend?: string
  variant?: 'default' | 'danger' | 'success'
  isCurrency?: boolean
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  isCurrency = false,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">{label}</p>
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center',
          variant === 'danger'  && 'bg-red-50',
          variant === 'success' && 'bg-green-50',
          variant === 'default' && 'bg-blue-50',
        )}>
          <Icon className={cn(
            'w-4 h-4',
            variant === 'danger'  && 'text-red-500',
            variant === 'success' && 'text-green-500',
            variant === 'default' && 'text-blue-500',
          )} />
        </div>
      </div>

      <p className={cn(
        'text-2xl font-semibold',
        variant === 'danger'  && 'text-red-600',
        variant === 'success' && 'text-green-600',
        variant === 'default' && 'text-slate-900',
      )}>
        {isCurrency && typeof value === 'number'
          ? formatCurrency(value)
          : value}
      </p>

      {trend && (
        <p className="text-xs text-slate-400 mt-1">{trend}</p>
      )}
    </div>
  )
}