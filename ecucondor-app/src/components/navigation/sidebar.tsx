import Link from 'next/link'

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r bg-gray-50 p-4 md:block">
      <nav className="space-y-2">
        <Link href="/dashboard" className="block rounded px-2 py-1 hover:bg-gray-200">
          Home
        </Link>
      </nav>
    </aside>
  )
}
