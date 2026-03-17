'use client'

import AddStoreDialog from '@/components/store/AddStoreDialog'
import { Store } from 'lucide-react'

export default function DashboardEmptyState() {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
      <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 font-medium">No stores yet</p>
      <p className="text-slate-400 text-sm mt-1 mb-4">
        Create your first store to get started
      </p>
      <AddStoreDialog />
    </div>
  )
}