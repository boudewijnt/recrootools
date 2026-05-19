import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'boudewijn@plgn.nl'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const [{ data: authData }, { data: profiles }, { data: ideeen }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('profiles').select('*'),
    admin.from('ideeen').select('*').order('aangemaakt_op', { ascending: false }),
  ])

  const authUsers = authData?.users ?? []

  const profileMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p])
  )
  const emailMap = Object.fromEntries(
    authUsers.map(u => [u.id, u.email ?? ''])
  )

  const gebruikers = authUsers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(u => ({
      id: u.id,
      email: u.email ?? '',
      naam: profileMap[u.id]?.full_name ?? '—',
      plan: profileMap[u.id]?.plan ?? 'free',
      lidSinds: new Date(u.created_at).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
    }))

  const ideeenLijst = (ideeen ?? []).map(i => ({
    id: i.id,
    inhoud: i.inhoud,
    datum: new Date(i.aangemaakt_op).toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'short', year: 'numeric',
    }),
    naam: profileMap[i.user_id]?.full_name ?? '—',
    email: emailMap[i.user_id] ?? '—',
  }))

  return (
    <main className="min-h-screen bg-white">
      <header className="px-8 py-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm hover:underline" style={{ color: '#9ba3a9' }}>
              ← Dashboard
            </a>
            <span style={{ color: '#e5e7eb' }}>|</span>
            <span className="text-sm font-semibold text-black">Admin</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ backgroundColor: '#f2f7f8', color: '#006f66' }}>
            {gebruikers.length} / 100 gebruikers
          </span>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-8 py-12 space-y-16">

        {/* ── Gebruikers ── */}
        <div>
          <h2 className="text-xl font-semibold text-black mb-1">Gebruikers</h2>
          <p className="text-sm mb-6" style={{ color: '#9ba3a9' }}>
            Alle geregistreerde accounts
          </p>

          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header rij */}
            <div
              className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
              style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr', color: '#9ba3a9', backgroundColor: '#f9fafb' }}
            >
              <span>Naam</span>
              <span>E-mail</span>
              <span>Plan</span>
              <span>Lid sinds</span>
            </div>

            {gebruikers.length === 0 && (
              <div className="px-5 py-8 text-sm text-center" style={{ color: '#9ba3a9' }}>
                Geen gebruikers gevonden
              </div>
            )}

            {gebruikers.map((g, i) => (
              <div
                key={g.id}
                className="grid items-center px-5 py-3.5 text-sm"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  borderTop: i === 0 ? 'none' : '1px solid #f3f4f6',
                }}
              >
                <span className="font-medium text-black">{g.naam}</span>
                <span style={{ color: '#9ba3a9' }}>{g.email}</span>
                <span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-md font-medium capitalize"
                    style={{ backgroundColor: '#f2f7f8', color: '#006f66' }}
                  >
                    {g.plan}
                  </span>
                </span>
                <span style={{ color: '#9ba3a9' }}>{g.lidSinds}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ideeën ── */}
        <div>
          <h2 className="text-xl font-semibold text-black mb-1">Ideeënbus</h2>
          <p className="text-sm mb-6" style={{ color: '#9ba3a9' }}>
            {ideeenLijst.length} {ideeenLijst.length === 1 ? 'idee' : 'ideeën'} ingediend
          </p>

          {ideeenLijst.length === 0 ? (
            <div
              className="rounded-2xl border border-gray-100 px-5 py-12 text-sm text-center"
              style={{ color: '#9ba3a9' }}
            >
              Nog geen ideeën ingediend
            </div>
          ) : (
            <div className="space-y-3">
              {ideeenLijst.map(i => (
                <div key={i.id} className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm text-black mb-3 leading-relaxed">{i.inhoud}</p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#9ba3a9' }}>
                    <span className="font-medium" style={{ color: '#1a2e30' }}>{i.naam}</span>
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

      </section>
    </main>
  )
}
