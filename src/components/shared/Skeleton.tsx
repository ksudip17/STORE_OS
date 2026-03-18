import { cn } from '@/lib/utils'

export function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={cn(
      'bg-slate-200 rounded-lg animate-pulse',
      className
    )} />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-9 w-9 rounded-lg" />
      </div>
      <SkeletonBox className="h-8 w-32 mb-1" />
      <SkeletonBox className="h-3 w-20" />
    </div>
  )
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <SkeletonBox className="w-10 h-10 rounded-lg" />
        <SkeletonBox className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBox className="h-4 w-32 mb-1.5" />
      <SkeletonBox className="h-3 w-24 mb-4" />
      <SkeletonBox className="h-3 w-20 mb-3" />
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <SkeletonBox className="h-8" />
        <SkeletonBox className="h-8" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-100">
      <SkeletonBox className="w-8 h-8 rounded-full shrink-0" />
      <SkeletonBox className="h-4 flex-1 max-w-[160px]" />
      <SkeletonBox className="h-4 flex-1 max-w-[120px]" />
      <SkeletonBox className="h-4 flex-1 max-w-[80px]" />
      <SkeletonBox className="h-6 w-14 rounded-full ml-auto" />
    </div>
  )
}