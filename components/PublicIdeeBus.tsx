'use client'

import { useState } from 'react'
import { stuurPubliekIdee } from '@/app/actions/ideeen'

type RecentIdee = {
  id: string
  inhoud: string
  daysAgo: string
}

type PublicIdeeBusProps = {
  recentIdeen: RecentIdee[]
}

type Status = 'idle' | 'laden' | 'succes' | 'fout'

export default function PublicIdeeBus({ recentIdeen }: PublicIdeeBusProps) {
  const [inhoud, setInhoud] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleVerstuur(e: React.FormEvent) {
    e.preventDefault()
    if (!inhoud.trim()) return
    setStatus('laden')
    const formData = new FormData()
    formData.set('inhoud', inhoud)
    const result = await stuurPubliekIdee(formData)
    if (result.error) {
      setStatus('fout')
    } else {
      setStatus('succes')
      setInhoud('')
    }
  }

  return (
    <div>
      {/* Form */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {status === 'succes' ? (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: '#0d1618', color: 'var(--color-accent)' }}
          >
            Bedankt! Je idee is ontvangen — we nemen het mee.
          </div>
        ) : (
          <form onSubmit={handleVerstuur}>
            <textarea
              value={inhoud}
              onChange={(e) => setInhoud(e.target.value)}
              placeholder="Beschrijf je idee zo concreet of vaag als je wilt…"
              className="w-full h-28 text-sm px-4 py-3 rounded-xl border outline-none resize-none transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-alt)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            {status === 'fout' && (
              <p className="text-sm mt-2" style={{ color: '#f87171' }}>
                Er ging iets mis. Probeer het opnieuw.
              </p>
            )}
            <button
              type="submit"
              disabled={!inhoud.trim() || status === 'laden'}
              className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {status === 'laden' ? 'Versturen…' : 'Idee insturen'}
            </button>
          </form>
        )}
      </div>

      {/* Recent ideas */}
      {recentIdeen.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-muted)' }}
          >
            Recente ideeën van recruiters
          </p>
          <div className="flex flex-col gap-3">
            {recentIdeen.map((idee) => (
              <div
                key={idee.id}
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  "{idee.inhoud}"
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                  — recruiter · {idee.daysAgo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
