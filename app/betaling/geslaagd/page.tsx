import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function BetalingGeslaagdPage() {
  const userId = await requireAuth()

  const [user] = await db`SELECT analyses_credits FROM users WHERE id = ${userId}`
  const credits = user ? Number(user.analyses_credits) : 0

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="max-w-sm w-full mx-4 rounded-2xl p-8 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
          style={{ backgroundColor: '#0a2216', color: '#4ade80' }}
        >
          ✓
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Betaling geslaagd
        </h1>
        <p className="text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
          10 analyses toegevoegd aan je account.
        </p>
        <p className="text-3xl font-bold mb-8" style={{ color: 'var(--color-accent)' }}>
          {credits} analyses beschikbaar
        </p>
        <Link
          href="/vacature-analyse"
          className="block w-full py-3 rounded-xl text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Start een analyse
        </Link>
      </div>
    </main>
  )
}
