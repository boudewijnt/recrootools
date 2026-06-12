import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db, toISOStr } from '@/lib/db'
import DarkLayout from '@/components/layout/DarkLayout'
import Badge from '@/components/ui/Badge'
import ToolCard from '@/components/ui/ToolCard'
import ComingSoonCard from '@/components/ui/ComingSoonCard'
import IdeeBus from '@/components/IdeeBus'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

const COMING_SOON = [
  { title: 'CV Screener',               description: "Upload CV's, AI rankt kandidaten op fit." },
  { title: 'Outreach Schrijver',         description: 'Gepersonaliseerde wervingsberichten.' },
  { title: 'Interview Vragen Generator', description: 'Vragen op basis van vacature + kandidaat.' },
  { title: 'Marktloon Checker',          description: 'Is jouw salaris competitief?' },
]

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/login')

  const [user] = await db`SELECT full_name, analyses_credits, created_at FROM users WHERE id = ${clerkUser.id}`

  const isAdmin = clerkUser.emailAddresses[0]?.emailAddress === ADMIN_EMAIL

  const lidSinds = user?.created_at
    ? new Date(toISOStr(user.created_at)).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : undefined

  return (
    <DarkLayout activeItem="dashboard" isAdmin={isAdmin}>
      <div className="px-8 py-10 max-w-4xl">

        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--color-muted)' }}>
          Dashboard
        </p>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Welkom{user?.full_name ? `, ${user.full_name}` : ''}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
          {clerkUser.emailAddresses[0]?.emailAddress}
        </p>

        <div className="mb-12">
          <Badge variant="plan" plan="free" startedAt={lidSinds} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-muted)' }}>
          Tools
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          <ToolCard
            href="/vacature-analyse"
            icon="✦"
            title="Vacature Analyse"
            description="Analyseer vacatureteksten op 6 criteria en ontvang een PDF-rapport."
            availability={`${user?.analyses_credits ?? 0} analyses resterend`}
          />
          {COMING_SOON.map((item) => (
            <ComingSoonCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>

        <div id="ideeen" className="max-w-xl">
          <IdeeBus />
        </div>

      </div>
    </DarkLayout>
  )
}
