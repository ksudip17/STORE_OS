import { getAllTransactions, getAnalyticsData } from '@/lib/actions/transactions-page'
import TransactionsClient from './TransactionsClient'

export default async function TransactionsPage() {
  const [transactions, analytics] = await Promise.all([
    getAllTransactions(),
    getAnalyticsData(),
  ])

  return (
    <TransactionsClient
      transactions={transactions}
      analytics={analytics}
    />
  )
}