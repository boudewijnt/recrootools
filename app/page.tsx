import { createAdminClient } from '@/lib/supabase/admin'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ToolCard from '@/components/ui/ToolCard'
import ComingSoonCard from '@/components/ui/ComingSoonCard'
import PublicIdeeBus from '@/components/PublicIdeeBus'

const COMING_SOON = [
  {
    title: 'CV Screener',
    description: "Upload CV's, AI rankt kandidaten op fit met de vacature.",
  },
  {
    title: 'Outreach Schrijver',
    description: 'Gepersonaliseerde wervingsberichten op basis van kandidaatprofiel.',
  },
  {
    title: 'Interview Vragen Generator',
    description: 'Gerichte interviewvragen op basis van vacature + kandidaat.',
  },
  {
    title: 'Marktloon Checker',
    description: 'Is het salaris in jouw vacature competitief? AI vergelijkt met de markt.',
  },
]

function daysAgoLabel(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return 'vandaag'
  if (diff === 1) return '1 dag geleden'
  return `${diff} dagen geleden`
}

export default async function Home() {
  const admin = createAdminClient()
  const { data: ideeen } = await admin
    .from('ideeen')
    .select('id, inhoud, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const recentIdeen = (ideeen ?? []).map((i) => ({
    id: i.id as string,
    inhoud: i.inhoud as string,
    daysAgo: daysAgoLabel(i.created_at as string),
  }))

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* ── Nav ── */}
      <header
        className="px-8 py-5 border-b sticky top-0 z-10"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full shrink-0"
              style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
            />
            <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Recrootools
            </span>
            <Badge variant="tag" label="BETA" />
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-muted)' }}
            >
              Inloggen
            </a>
            <Button href="/signup" size="sm">Gratis starten</Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Badge variant="tag" label="AI-GEDREVEN" />
          <Badge variant="tag" label="COMMUNITY-BUILT" />
          <Badge variant="tag" label="GRATIS STARTEN" />
        </div>
        <h1 className="text-5xl font-extrabold leading-tight mb-6" style={{ color: 'var(--color-text)' }}>
          AI-tools gebouwd<br />
          <span style={{ color: 'var(--color-accent)' }}>door en voor recruiters</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Geen generieke software. Recrootools bouwt precies wat recruiters nodig hebben — samen met jou.
        </p>
        <div className="flex gap-4 justify-center">
          <Button href="/signup">Gratis starten</Button>
          <Button href="#tools" variant="ghost">Bekijk tools ↓</Button>
        </div>
      </section>

      {/* ── Beschikbaar nu ── */}
      <section id="tools" className="max-w-5xl mx-auto px-8 pb-20">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: 'var(--color-muted)' }}
        >
          Beschikbaar nu
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ToolCard
            href="/vacature-analyse"
            icon="✦"
            title="Vacature Analyse"
            description="Analyseer vacatureteksten op 6 criteria: leesbaarheid, inclusiviteit, aantrekkelijkheid, duidelijkheid, marktaansluiting en structuur. Inclusief PDF-rapport."
            availability="Gratis beschikbaar"
          />
        </div>
      </section>

      {/* ── In ontwikkeling ── */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: 'var(--color-muted)' }}
        >
          In ontwikkeling
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COMING_SOON.map((item) => (
            <ComingSoonCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      {/* ── Community / Ideeënbus ── */}
      <section
        className="border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto px-8 py-20">
          <div className="max-w-xl">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Community
            </p>
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Jij bepaalt wat we bouwen
            </h2>
            <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Recrootools is community-driven. Stuur een idee in — de meest gevraagde tools bouwen we als volgende.
            </p>
            <PublicIdeeBus recentIdeen={recentIdeen} />
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section
        className="border-t text-center py-20"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
          Klaar om te starten?
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
          Gratis account, geen creditcard nodig.
        </p>
        <Button href="/signup">Gratis starten</Button>
      </section>

    </main>
  )
}
