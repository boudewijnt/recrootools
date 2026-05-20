'use client'

import type { CriteriumScore } from '@/lib/types'

const NAMEN: Record<string, string> = {
  perspectief:            'Perspectief',
  wiifm:                  'WIIFM',
  inclusief:              'Inclusief',
  b2niveau:               'B2-niveau',
  cta:                    'Call to action',
  compleetheid:           'Compleetheid',
  rolToonMatch:           'Rol-toon match',
  vindbaarheid:           'Vindbaarheid (SEO)',
  knockOut:               'Knock-outeisen',
  onderscheidendVermogen: 'Onderscheidend vermogen',
  employerBranding:       'Employer branding',
  praktischeInfo:         'Praktische info',
  toneOfVoice:            'Tone-of-voice',
}

function scoreKleur(score: number) {
  if (score >= 7) return { bg: '#006f66', light: '#e8f5f3', text: '#006f66', border: '#006f66' }
  if (score >= 5) return { bg: '#e8902c', light: '#fdf3e7', text: '#c47420', border: '#e8902c' }
  return { bg: '#c0392b', light: '#fde8e7', text: '#c0392b', border: '#c0392b' }
}

interface Props {
  sleutel: string
  data: CriteriumScore
  prioriteit?: boolean
}

export default function CriterionCard({ sleutel, data, prioriteit }: Props) {
  const kleur = scoreKleur(data.score)
  const naam = NAMEN[sleutel] ?? sleutel

  return (
    <div
      className="rounded-xl border-2 overflow-hidden"
      style={{ borderColor: prioriteit ? '#006f66' : kleur.border }}
    >
      <div style={{ height: 4, backgroundColor: kleur.bg }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {prioriteit && <span className="text-base">★</span>}
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#1a2e30' }}>
              {naam}
            </span>
          </div>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-md text-white"
            style={{ backgroundColor: kleur.bg }}
          >
            {data.oordeel} · {data.score}/10
          </span>
        </div>

        <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: '#f2f7f8' }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${data.score * 10}%`, backgroundColor: kleur.bg }}
          />
        </div>

        <p className="text-sm mb-3" style={{ color: '#3d5a5e' }}>
          {data.toelichting}
        </p>

        <div className="rounded-lg p-3" style={{ backgroundColor: '#e8f5f3' }}>
          <p className="text-sm" style={{ color: '#006f66' }}>
            <span className="font-semibold">Tip:</span> {data.tip}
          </p>
        </div>
      </div>
    </div>
  )
}
