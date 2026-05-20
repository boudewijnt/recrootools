'use client'

import { useState } from 'react'
import CriterionCard from './CriterionCard'
import type { AnalyseData, AnalyseResult, CriteriumScore } from '@/lib/types'

const PRIORITEITS_CRITERIA = ['perspectief', 'wiifm']
const VOLGORDE = ['perspectief', 'wiifm', 'inclusief', 'b2niveau', 'cta', 'compleetheid'] as const

interface Props {
  data: AnalyseData
}

export default function ResultsView({ data }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [downloadFout, setDownloadFout] = useState<string | null>(null)

  const { analyse } = data
  const scores = VOLGORDE.map((k) => analyse[k as keyof AnalyseResult]).filter(
    (v): v is CriteriumScore => typeof v === 'object' && v !== null && 'score' in v
  )
  const gemiddelde = Math.round(
    scores.reduce((s, c) => s + c.score, 0) / scores.length * 10
  )
  const aantalGoed = scores.filter((c) => c.score >= 7).length
  const aantalAandacht = scores.filter((c) => c.oordeel !== 'goed').length

  async function downloadPDF() {
    setDownloading(true)
    setDownloadFout(null)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('PDF genereren mislukt')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Vacature Analyse ${data.context.functietitel} - ${data.context.bedrijfsnaam}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadFout('PDF downloaden mislukt. Probeer het opnieuw.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Samenvatting balk */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#f2f7f8' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-semibold" style={{ color: '#006f66' }}>{gemiddelde}%</p>
              <p className="text-xs mt-1" style={{ color: '#9ba3a9' }}>Gemiddelde score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold" style={{ color: '#006f66' }}>{aantalGoed}</p>
              <p className="text-xs mt-1" style={{ color: '#9ba3a9' }}>Criteria goed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold" style={{ color: '#c0392b' }}>{aantalAandacht}</p>
              <p className="text-xs mt-1" style={{ color: '#9ba3a9' }}>Aandachtspunten</p>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#006f66' }}
          >
            {downloading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Genereren…
              </>
            ) : (
              'Download rapport (PDF)'
            )}
          </button>
        </div>
        {downloadFout && (
          <p className="text-sm mt-3" style={{ color: '#c0392b' }}>{downloadFout}</p>
        )}
      </div>

      {/* Samenvatting tekst */}
      <div className="rounded-xl border-l-4 p-5" style={{ borderColor: '#006f66', backgroundColor: '#f2f7f8' }}>
        <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#006f66' }}>Kort & goed</p>
        <p className="text-sm" style={{ color: '#3d5a5e' }}>{analyse.samenvatting}</p>
      </div>

      {/* Criteria grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1a2e30' }}>Beoordeling per criterium</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOLGORDE.map((sleutel) => (
            <CriterionCard
              key={sleutel}
              sleutel={sleutel}
              data={analyse[sleutel as keyof AnalyseResult] as Parameters<typeof CriterionCard>[0]['data']}
              prioriteit={PRIORITEITS_CRITERIA.includes(sleutel)}
            />
          ))}
        </div>
      </div>

      {/* Top 3 */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1a2e30' }}>Top 3 verbeterpunten</h2>
        <div className="space-y-4">
          {analyse.top3.map((item, i) => {
            const kleur = i === 0 ? '#c0392b' : i === 1 ? '#e8902c' : '#6895a2'
            return (
              <div key={i} className="flex rounded-xl overflow-hidden" style={{ backgroundColor: '#f2f7f8' }}>
                <div
                  className="flex items-center justify-center w-12 shrink-0"
                  style={{ backgroundColor: kleur }}
                >
                  <span className="text-white font-semibold text-lg">{i + 1}</span>
                </div>
                <div className="p-4 flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: '#1a2e30' }}>{item.titel}</p>
                  <p className="text-sm mb-2" style={{ color: '#3d5a5e' }}>{item.probleem}</p>
                  <p className="text-sm font-medium" style={{ color: '#006f66' }}>
                    Advies: {item.advies}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
