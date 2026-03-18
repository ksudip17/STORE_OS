import { TableRowSkeleton } from '@/components/shared/Skeleton'

export default function CustomersLoading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="h-9 bg-slate-100 rounded-lg animate-pulse mb-2" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-slate-100 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}