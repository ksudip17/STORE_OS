'use client'

import AddStoreDialog from '@/components/store/AddStoreDialog'

interface Props {
  storeCount: number
  customerCount: number
}

export default function DashboardHeader({ storeCount, customerCount }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {storeCount} store{storeCount !== 1 ? 's' : ''} · {customerCount} customers
        </p>
      </div>
      <AddStoreDialog />
    </div>
  )
}