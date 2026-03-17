'use client'

import { useRealtimeDashboard } from '@/hooks/useRealtime'

interface Props {
  storeIds: string[]
  children: React.ReactNode
}

export default function DashboardRealtime({ storeIds, children }: Props) {
  useRealtimeDashboard(storeIds)
  return <>{children}</>
}