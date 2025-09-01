'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="flex items-center justify-between border-b px-4 py-2">
      <span className="font-semibold">Dashboard</span>
      <button
        onClick={handleSignOut}
        className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
      >
        Sign out
      </button>
    </nav>
  )
}
