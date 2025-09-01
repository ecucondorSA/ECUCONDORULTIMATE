'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: number
  date: string
  type: string
  amount: number
}

export function TransactionsTable() {
  const [data, setData] = useState<Transaction[]>([])

  useEffect(() => {
    // TODO: replace with real API call
    setData([
      { id: 1, date: '2024-01-01', type: 'buy', amount: 100 },
      { id: 2, date: '2024-01-02', type: 'sell', amount: 50 },
    ])
  }, [])

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Date</th>
          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Type</th>
          <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((tx) => (
          <tr key={tx.id}>
            <td className="px-3 py-2">{tx.date}</td>
            <td className="px-3 py-2 capitalize">{tx.type}</td>
            <td className="px-3 py-2">{tx.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
