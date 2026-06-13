'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <button
      onClick={() => signOut({ redirectUrl: '/login' })}
      title="Uitloggen"
      className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors hover:opacity-80"
      style={{ color: 'var(--color-muted)' }}
    >
      →
    </button>
  )
}
