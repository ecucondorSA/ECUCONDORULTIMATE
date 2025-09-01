import { Suspense } from 'react'
import { TransactionsTable } from '@/components/transactions/transactions-table'

export default function TransactionsPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Transactions</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <TransactionsTable />
      </Suspense>
    </div>
  )
}
