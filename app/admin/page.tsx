import { requireAdmin } from '@/lib/auth'
import { db, toISOStr } from '@/lib/db'
import DarkLayout from '@/components/layout/DarkLayout'
import StatCard from '@/components/ui/StatCard'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  await requireAdmin()

  const [users, ideeen, betalingen] = await Promise.all([
    db`SELECT id, email, full_name, analyses_credits, created_at FROM users ORDER BY created_at DESC`,
    db`
      SELECT i.id, i.inhoud, i.created_at, u.full_name, u.email as user_email
      FROM ideeen i
      LEFT JOIN users u ON u.id = i.user_id
      ORDER BY i.created_at DESC
    `,
    db`
      SELECT b.id, b.user_id, b.credits, b.bedrag, b.status, b.created_at, b.paid_at,
             u.email as user_email, u.full_name as user_name
      FROM betalingen b
      LEFT JOIN users u ON u.id = b.user_id
      ORDER BY b.created_at DESC
    `,
  ])

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = users.filter(u => new Date(toISOStr(u.created_at)) > oneWeekAgo).length

  const usersForClient = users.map(u => ({
    id: u.id as string,
    email: u.email as string,
    full_name: u.full_name as string | null,
    analyses_credits: Number(u.analyses_credits),
    created_at: toISOStr(u.created_at),
  }))

  const ideeeenForClient = ideeen.map(i => ({
    id: i.id as string,
    inhoud: i.inhoud as string,
    created_at: toISOStr(i.created_at),
    full_name: i.full_name as string | null,
    user_email: i.user_email as string | null,
  }))

  const betalingenForClient = betalingen.map(b => ({
    id: b.id as string,
    user_id: b.user_id as string,
    credits: Number(b.credits),
    bedrag: String(b.bedrag),
    status: b.status as string,
    created_at: toISOStr(b.created_at),
    paid_at: b.paid_at ? toISOStr(b.paid_at) : null,
    user_email: b.user_email as string | null,
    user_name: b.user_name as string | null,
  }))

  return (
    <DarkLayout activeItem="admin" isAdmin={true}>
      <div className="px-8 py-10 max-w-5xl space-y-10">

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Admin
          </p>
          <span
            className="text-xs px-2.5 py-1 rounded-md font-semibold"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
          >
            {users.length} gebruikers
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard value={users.length} label="gebruikers" />
          <StatCard value={betalingen.filter(b => b.status === 'paid').length} label="betalingen" />
          <StatCard value={`+${newThisWeek}`} label="nieuwe deze week" positive={newThisWeek > 0} />
        </div>

        <AdminClient
          users={usersForClient}
          betalingen={betalingenForClient}
          ideeen={ideeeenForClient}
        />

      </div>
    </DarkLayout>
  )
}
