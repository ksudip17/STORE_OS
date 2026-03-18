import { TableRowSkeleton, StatCardSkeleton } from '@/components/shared/Skeleton'

export default function StoreLoading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="flex-1 bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}