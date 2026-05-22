import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DarkLayout from '@/components/layout/DarkLayout'
import Badge from '@/components/ui/Badge'
import ToolCard from '@/components/ui/ToolCard'
import ComingSoonCard from '@/components/ui/ComingSoonCard'
import IdeeBus from '@/components/IdeeBus'

const ADMIN_EMAIL = 'boudewijn@plgn.nl'

const COMING_SOON = [
  { title: 'CV Screener',               description: "Upload CV's, AI rankt kandidaten op fit." },
  { title: 'Outreach Schrijver',         description: 'Gepersonaliseerde wervingsberichten.' },
  { title: 'Interview Vragen Generator', description: 'Vragen op basis van vacature + kandidaat.' },
  { title: 'Marktloon Checker',          description: 'Is jouw salaris competitief?' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, plan_started_at')
    .eq('id', user.id)
    .single()

  const planStarted = profile?.plan_started_at
    ? new Date(profile.plan_started_at).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : undefined

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <DarkLayout activeItem="dashboard" isAdmin={isAdmin}>
      <div className="px-8 py-10 max-w-4xl">

        {/* Header */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: 'var(--color-muted)' }}
        >
          Dashboard
        </p>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Welkom{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
          {user.email}
        </p>

        {/* Plan badge */}
        <div className="mb-12">
          <Badge
            variant="plan"
            plan={profile?.plan ?? 'free'}
            startedAt={planStarted}
          />
        </div>

        {/* Tools */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ color: 'var(--color-muted)' }}
        >
          Tools
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          <ToolCard
            href="/vacature-analyse"
            icon="✦"
            title="Vacature Analyse"
            description="Analyseer vacatureteksten op 6 criteria en ontvang een PDF-rapport."
            availability="Gratis beschikbaar"
          />
          {COMING_SOON.map((item) => (
            <ComingSoonCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>

        {/* Ideeënbus */}
        <div id="ideeen" className="max-w-xl">
          <IdeeBus />
        </div>

      </div>
    </DarkLayout>
  )
}
