import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import DarkLayout from '@/components/layout/DarkLayout'
import StatCard from '@/components/ui/StatCard'

const ADMIN_EMAIL = 'boudewijn@plgn.nl'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const [{ data: authData }, { data: profiles }, { data: ideeen, error: ideeenError }] =
    await Promise.all([
      admin.auth.admin.listUsers({ perPage: 200 }),
      admin.from('profiles').select('*'),
      admin.from('ideeen').select('*'),
    ])

  const authUsers = authData?.users ?? []

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const emailMap   = Object.fromEntries(authUsers.map((u) => [u.id, u.email ?? '']))

  const gebruikers = authUsers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((u) => ({
      id: u.id,
      email: u.email ?? '',
      naam:
        profileMap[u.id]?.full_name ??
        (u.user_metadata as Record<string, string>)?.full_name ??
        '—',
      plan: profileMap[u.id]?.plan ?? 'free',
      lidSinds: new Date(u.created_at).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
    }))

  const ideeenLijst = (ideeen ?? [])
    .sort((a, b) => {
      const da = a.created_at ?? a.aangemaakt_op ?? ''
      const db = b.created_at ?? b.aangemaakt_op ?? ''
      return db.localeCompare(da)
    })
    .map((i) => {
      const ts = i.created_at ?? i.aangemaakt_op
      const authUser = authUsers.find((u) => u.id === i.user_id)
      return {
        id: i.id,
        inhoud: i.inhoud,
        datum: ts
          ? new Date(ts).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—',
        naam:
          profileMap[i.user_id]?.full_name ??
          (authUser?.user_metadata as Record<string, string>)?.full_name ??
          'anoniem',
        email: emailMap[i.user_id] ?? '—',
      }
    })

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = authUsers.filter(
    (u) => new Date(u.created_at) > oneWeekAgo
  ).length

  return (
    <DarkLayout activeItem="admin" isAdmin={true}>
      <div className="px-8 py-10 max-w-4xl space-y-16">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Admin
          </p>
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
          >
            {gebruikers.length} / 100 gebruikers
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={gebruikers.length} label="gebruikers" />
          <StatCard value={ideeenLijst.length} label="ideeën" />
          <StatCard value={`+${newThisWeek}`} label="nieuwe deze week" positive={newThisWeek > 0} />
        </div>

        {/* Gebruikers tabel */}
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Gebruikers
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            Alle geregistreerde accounts
          </p>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div
              className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
              style={{
                gridTemplateColumns: '2fr 2fr 1fr 1fr',
                color: 'var(--color-muted)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <span>Naam</span>
              <span>E-mail</span>
              <span>Plan</span>
              <span>Lid sinds</span>
            </div>

            {gebruikers.length === 0 && (
              <div className="px-5 py-8 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                Geen gebruikers gevonden
              </div>
            )}

            {gebruikers.map((g, i) => (
              <div
                key={g.id}
                className="grid items-center px-5 py-3.5 text-sm"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  borderTop: i === 0 ? 'none' : `1px solid var(--color-border)`,
                  backgroundColor: 'var(--color-surface-alt)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{g.naam}</span>
                <span style={{ color: 'var(--color-muted)' }}>{g.email}</span>
                <span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-md font-medium capitalize"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
                  >
                    {g.plan}
                  </span>
                </span>
                <span style={{ color: 'var(--color-muted)' }}>{g.lidSinds}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ideeënbus */}
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Ideeënbus
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            {ideeenError
              ? 'Query mislukt — zie fout hieronder'
              : `${ideeenLijst.length} ${ideeenLijst.length === 1 ? 'idee' : 'ideeën'} ingediend`}
          </p>

          {ideeenError && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm font-mono"
              style={{ backgroundColor: '#1a0a0a', color: '#f87171' }}
            >
              Query fout: {ideeenError.message}
            </div>
          )}

          {ideeenLijst.length === 0 ? (
            <div
              className="rounded-2xl px-5 py-12 text-sm text-center"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            >
              Nog geen ideeën ingediend
            </div>
          ) : (
            <div className="space-y-3">
              {ideeenLijst.map((i) => (
                <div
                  key={i.id}
                  className="rounded-2xl p-5"
                  style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text)' }}>
                    {i.inhoud}
                  </p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{i.naam}</span>
                    <span>·</span>
                    <span>{i.email}</span>
                    <span>·</span>
                    <span>{i.datum}</span>
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
