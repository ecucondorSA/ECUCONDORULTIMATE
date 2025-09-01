import type { ReactNode } from 'react'
import { Sidebar } from '@/components/navigation/sidebar'
import { Navbar } from '@/components/navigation/navbar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
