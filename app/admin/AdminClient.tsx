'use client'

import { useState, useTransition } from 'react'
import { setCredits, deleteIdee } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  full_name: string | null
  analyses_credits: number
  created_at: string
}

type Betaling = {
  id: string
  user_id: string
  credits: number
  bedrag: string
  status: string
  created_at: string
  paid_at: string | null
  user_email: string | null
  user_name: string | null
}

type Idee = {
  id: string
  inhoud: string
  created_at: string
  full_name: string | null
  user_email: string | null
}

type Tab = 'gebruikers' | 'betalingen' | 'ideeen'

type Props = {
  users: User[]
  betalingen: Betaling[]
  ideeen: Idee[]
}

export default function AdminClient({ users, betalingen, ideeen }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('gebruikers')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCredits, setEditCredits] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function startEdit(user: User) {
    setEditingId(user.id)
    setEditCredits(String(user.analyses_credits))
    setError(null)
  }

  function saveCredits(userId: string) {
    const val = parseInt(editCredits)
    if (isNaN(val)) { setError('Voer een geldig getal in'); return }
    startTransition(async () => {
      const res = await setCredits(userId, val)
      if (res.error) { setError(res.error); return }
      setEditingId(null)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteIdee(id)
      router.refresh()
    })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'gebruikers', label: 'Gebruikers' },
    { key: 'betalingen', label: 'Betalingen' },
    { key: 'ideeen',     label: 'Ideeën' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-8" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: activeTab === t.key ? 'var(--color-accent)' : 'var(--color-muted)',
              borderBottom: activeTab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gebruikers */}
      {activeTab === 'gebruikers' && (
        <div>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            {users.length} gebruikers · klik op credits om te wijzigen
          </p>
          {error && <p className="text-sm mb-4" style={{ color: '#f87171' }}>{error}</p>}

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div
              className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
              style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 80px', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
            >
              <span>Naam</span><span>E-mail</span><span>Credits</span><span>Lid sinds</span><span></span>
            </div>

            {users.length === 0 && (
              <div className="px-5 py-8 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                Geen gebruikers
              </div>
            )}

            {users.map((u, i) => (
              <div
                key={u.id}
                className="grid items-center px-5 py-3 text-sm"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 80px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-alt)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{u.full_name ?? '—'}</span>
                <span style={{ color: 'var(--color-muted)' }}>{u.email}</span>
                <span>
                  {editingId === u.id ? (
                    <input
                      type="number"
                      value={editCredits}
                      onChange={e => setEditCredits(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveCredits(u.id); if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                      className="w-20 px-2 py-1 text-sm rounded-lg border outline-none"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(u)}
                      className="text-xs px-2 py-0.5 rounded-md font-medium transition-opacity hover:opacity-70"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
                    >
                      {u.analyses_credits}
                    </button>
                  )}
                </span>
                <span style={{ color: 'var(--color-muted)' }}>
                  {new Date(u.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span>
                  {editingId === u.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveCredits(u.id)}
                        disabled={isPending}
                        className="text-xs px-2 py-1 rounded-lg font-medium text-white disabled:opacity-40"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Betalingen */}
      {activeTab === 'betalingen' && (
        <div>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            {betalingen.length} betalingen
          </p>

          {betalingen.length === 0 ? (
            <div className="rounded-2xl px-5 py-12 text-sm text-center" style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              Nog geen betalingen
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div
                className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
              >
                <span>Gebruiker</span><span>Bedrag</span><span>Credits</span><span>Status</span><span>Datum</span>
              </div>
              {betalingen.map((b, i) => (
                <div
                  key={b.id}
                  className="grid items-center px-5 py-3 text-sm"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-alt)',
                  }}
                >
                  <span style={{ color: 'var(--color-muted)' }}>{b.user_email ?? b.user_id.slice(0, 8)}</span>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>€{Number(b.bedrag).toFixed(2)}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{b.credits}</span>
                  <span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: b.status === 'paid' ? '#0a2216' : 'var(--color-surface)',
                        color: b.status === 'paid' ? '#4ade80' : b.status === 'pending' ? 'var(--color-muted)' : '#f87171',
                      }}
                    >
                      {b.status}
                    </span>
                  </span>
                  <span style={{ color: 'var(--color-muted)' }}>
                    {new Date(b.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ideeën */}
      {activeTab === 'ideeen' && (
        <div>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            {ideeen.length} {ideeen.length === 1 ? 'idee' : 'ideeën'}
          </p>

          {ideeen.length === 0 ? (
            <div className="rounded-2xl px-5 py-12 text-sm text-center" style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              Nog geen ideeën
            </div>
          ) : (
            <div className="space-y-3">
              {ideeen.map(i => (
                <div
                  key={i.id}
                  className="rounded-2xl p-5"
                  style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text)' }}>{i.inhoud}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                      <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{i.full_name ?? 'anoniem'}</span>
                      <span>·</span>
                      <span>{i.user_email ?? '—'}</span>
                      <span>·</span>
                      <span>{new Date(i.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(i.id)}
                      disabled={isPending}
                      className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40"
                      style={{ color: '#f87171', backgroundColor: 'var(--color-surface-alt)' }}
                    >
                      verwijder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
