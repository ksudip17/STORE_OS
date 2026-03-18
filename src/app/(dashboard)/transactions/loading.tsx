import { TableRowSkeleton } from '@/components/shared/Skeleton'

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mt-3" />
      </div>
      <div className="flex-1 bg-white">
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}