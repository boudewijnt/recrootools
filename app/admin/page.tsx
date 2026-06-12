import { requireAdmin } from '@/lib/auth'
import { db, toISOStr } from '@/lib/db'
import DarkLayout from '@/components/layout/DarkLayout'
import StatCard from '@/components/ui/StatCard'

export default async function AdminPage() {
  await requireAdmin()

  const [users, ideeen] = await Promise.all([
    db`SELECT id, email, full_name, analyses_credits, created_at FROM users ORDER BY created_at DESC`,
    db`
      SELECT i.id, i.inhoud, i.created_at, i.user_id, u.full_name, u.email as user_email
      FROM ideeen i
      LEFT JOIN users u ON u.id = i.user_id
      ORDER BY i.created_at DESC
    `,
  ])

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = users.filter(
    (u) => new Date(toISOStr(u.created_at)) > oneWeekAgo
  ).length

  return (
    <DarkLayout activeItem="admin" isAdmin={true}>
      <div className="px-8 py-10 max-w-4xl space-y-16">

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Admin
          </p>
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
          >
            {users.length} / 100 gebruikers
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard value={users.length} label="gebruikers" />
          <StatCard value={ideeen.length} label="ideeën" />
          <StatCard value={`+${newThisWeek}`} label="nieuwe deze week" positive={newThisWeek > 0} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Gebruikers</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Alle geregistreerde accounts</p>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div
              className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
              style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
            >
              <span>Naam</span><span>E-mail</span><span>Credits</span><span>Lid sinds</span>
            </div>

            {users.length === 0 && (
              <div className="px-5 py-8 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                Geen gebruikers gevonden
              </div>
            )}

            {users.map((g, i) => (
              <div
                key={g.id}
                className="grid items-center px-5 py-3.5 text-sm"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-alt)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{g.full_name ?? '—'}</span>
                <span style={{ color: 'var(--color-muted)' }}>{g.email}</span>
                <span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
                  >
                    {g.analyses_credits}
                  </span>
                </span>
                <span style={{ color: 'var(--color-muted)' }}>
                  {new Date(toISOStr(g.created_at)).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Ideeënbus</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            {ideeen.length} {ideeen.length === 1 ? 'idee' : 'ideeën'} ingediend
          </p>

          {ideeen.length === 0 ? (
            <div className="rounded-2xl px-5 py-12 text-sm text-center" style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              Nog geen ideeën ingediend
            </div>
          ) : (
            <div className="space-y-3">
              {ideeen.map((i) => (
                <div key={i.id} className="rounded-2xl p-5" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text)' }}>{i.inhoud}</p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{i.full_name ?? 'anoniem'}</span>
                    <span>·</span>
                    <span>{i.user_email ?? '—'}</span>
                    <span>·</span>
                    <span>
                      {i.created_at
                        ? new Date(toISOStr(i.created_at)).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DarkLayout>
  )
}
