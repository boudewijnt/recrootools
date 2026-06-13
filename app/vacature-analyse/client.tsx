'use client'

import { useState } from 'react'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import ResultsView from '@/components/ResultsView'
import CreditsDisplay from '@/components/CreditsDisplay'
import Paywall from '@/components/Paywall'
import type { ExtractResult, VacatureContext, AnalyseResult, AnalyseData } from '@/lib/types'

type Stap = 'invoer' | 'context' | 'laden' | 'resultaat'
type InvoerModus = 'url' | 'tekst'

type Props = {
  credits: number
}

export default function VacatureAnalyseClient({ credits: initialCredits }: Props) {
  const [credits, setCredits] = useState(initialCredits)
  const [stap, setStap] = useState<Stap>('invoer')
  const [invoerModus, setInvoerModus] = useState<InvoerModus>('url')
  const [url, setUrl] = useState('')
  const [vacaturetekst, setVacaturetekst] = useState('')
  const [extract, setExtract] = useState<ExtractResult | null>(null)
  const [analyseData, setAnalyseData] = useState<AnalyseData | null>(null)
  const [fout, setFout] = useState<string | null>(null)
  const [ophalen, setOphalen] = useState(false)
  const [extraheert, setExtraheert] = useState(false)
  const [showPaywall, setShowPaywall] = useState(initialCredits <= 0)

  async function handleUrl() {
    if (!url.trim()) return
    setFout(null)
    setOphalen(true)

    let tekst = ''
    try {
      const res = await fetch('/api/fetch-vacature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Ophalen mislukt')
      tekst = json.tekst
      setVacaturetekst(tekst)
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Kon de URL niet ophalen. Controleer de URL en probeer opnieuw.')
      setOphalen(false)
      return
    }

    setOphalen(false)
    await analyseerTekst(tekst)
  }

  async function handleAnalyseer() {
    if (!vacaturetekst.trim()) return
    setFout(null)
    await analyseerTekst(vacaturetekst)
  }

  async function analyseerTekst(tekst: string) {
    setExtraheert(true)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacaturetekst: tekst }),
      })
      if (!res.ok) throw new Error('Extractie mislukt')
      const data: ExtractResult = await res.json()
      setExtract(data)
      setStap('context')
    } catch {
      setFout('Kon de vacaturetekst niet analyseren. Controleer de invoer en probeer opnieuw.')
    } finally {
      setExtraheert(false)
    }
  }

  async function handleContextKlaar(context: VacatureContext) {
    setFout(null)
    setStap('laden')

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacaturetekst, context }),
      })

      if (res.status === 402) {
        setShowPaywall(true)
        setStap('context')
        return
      }

      if (!res.ok) throw new Error('Analyse mislukt')
      const analyse: AnalyseResult = await res.json()
      setAnalyseData({ vacaturetekst, context, analyse })
      setCredits(prev => Math.max(0, prev - 1))
      setStap('resultaat')
    } catch {
      setFout('De analyse is mislukt. Probeer het opnieuw.')
      setStap('context')
    }
  }

  function opnieuw() {
    setStap('invoer')
    setUrl('')
    setVacaturetekst('')
    setExtract(null)
    setAnalyseData(null)
    setFout(null)
  }

  const bezig = ophalen || extraheert
  const labelKnop = ophalen ? 'URL ophalen…' : extraheert ? 'Tekst lezen…' : 'Analyseer'

  return (
    <main className="min-h-screen bg-white">
      {showPaywall && <Paywall />}

      <header className="px-8 py-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm hover:underline" style={{ color: '#9ba3a9' }}>
              ← Dashboard
            </Link>
            <span style={{ color: '#e5e7eb' }}>|</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: '#006f66' }}
              >
                ✦
              </div>
              <span className="text-sm font-semibold" style={{ color: '#1a2e30' }}>
                Vacature Analyse
              </span>
            </div>
          </div>
          <CreditsDisplay credits={credits} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {stap === 'invoer' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-2" style={{ color: '#1a2e30' }}>
              Vacature analyseren
            </h1>
            <p className="text-sm mb-8" style={{ color: '#9ba3a9' }}>
              Voer een URL in of plak de tekst en ontvang een gedetailleerde analyse op 6 criteria.
            </p>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-gray-100">
              {(['url', 'tekst'] as InvoerModus[]).map((modus) => (
                <button
                  key={modus}
                  onClick={() => { setInvoerModus(modus); setFout(null) }}
                  className="pb-3 text-sm font-medium transition-colors"
                  style={{
                    color: invoerModus === modus ? '#1a2e30' : '#9ba3a9',
                    borderBottom: invoerModus === modus ? '2px solid #006f66' : '2px solid transparent',
                  }}
                >
                  {modus === 'url' ? 'URL opgeven' : 'Tekst plakken'}
                </button>
              ))}
            </div>

            {invoerModus === 'url' ? (
              <>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !bezig && handleUrl()}
                  placeholder="https://bedrijf.nl/vacatures/functietitel"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#006f66] transition-colors"
                  style={{ color: '#1a2e30' }}
                />
                <p className="text-xs mt-2" style={{ color: '#9ba3a9' }}>
                  Werkt met openbare vacaturepagina's. LinkedIn en Indeed worden niet ondersteund.
                </p>
              </>
            ) : (
              <textarea
                value={vacaturetekst}
                onChange={(e) => setVacaturetekst(e.target.value)}
                placeholder="Plak hier de volledige vacaturetekst…"
                className="w-full h-64 text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:border-[#006f66] transition-colors"
                style={{ color: '#1a2e30' }}
              />
            )}

            {fout && (
              <p className="text-sm mt-3" style={{ color: '#c0392b' }}>{fout}</p>
            )}

            <button
              onClick={invoerModus === 'url' ? handleUrl : handleAnalyseer}
              disabled={(invoerModus === 'url' ? !url.trim() : !vacaturetekst.trim()) || bezig}
              className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#006f66' }}
            >
              {bezig ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {labelKnop}
                </span>
              ) : (
                'Analyseer'
              )}
            </button>
          </div>
        )}

        {stap === 'context' && extract && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: '#1a2e30' }}>Context bevestigen</h2>
            <p className="text-sm mb-6" style={{ color: '#9ba3a9' }}>
              Controleer de gevonden informatie en beantwoord eventuele vragen.
            </p>
            {fout && <p className="text-sm mb-4" style={{ color: '#c0392b' }}>{fout}</p>}
            <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ minHeight: 400 }}>
              <ChatInterface extract={extract} onKlaar={handleContextKlaar} />
            </div>
          </div>
        )}

        {stap === 'laden' && (
          <div className="flex flex-col items-center justify-center py-24 gap-10">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-10 h-10 border-4 border-gray-100 rounded-full" style={{ borderTopColor: '#006f66' }} />
              <p className="text-sm" style={{ color: '#9ba3a9' }}>Vacature wordt geanalyseerd…</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-60 animate-pulse" style={{ background: 'radial-gradient(ellipse at center, #006f6644 0%, #7db4c322 60%, transparent 100%)' }} />
              <a
                href="https://pluginrecruitment.nl/recruitmentscan"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block max-w-sm rounded-2xl p-6 text-center transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px 0 rgba(0,111,102,0.10)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mx-auto mb-4"
                  style={{ backgroundColor: '#006f66' }}
                >
                  ✦
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: '#1a2e30' }}>
                  Op zoek naar verbetering van je werving?
                </p>
                <p className="text-sm mb-4" style={{ color: '#9ba3a9' }}>
                  Ontdek de Recruitmentscan — een grondige analyse van je hele wervingsproces.
                </p>
                <span
                  className="inline-block text-sm font-semibold px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#006f66' }}
                >
                  Meer informatie →
                </span>
              </a>
            </div>
          </div>
        )}

        {stap === 'resultaat' && analyseData && (
          <div>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: '#1a2e30' }}>
                  {analyseData.context.functietitel}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#9ba3a9' }}>
                  {analyseData.context.bedrijfsnaam} · {analyseData.context.senioriteit} · {analyseData.context.sector}
                </p>
              </div>
              <button
                onClick={opnieuw}
                className="text-sm px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#e5e7eb', color: '#9ba3a9' }}
              >
                Nieuwe analyse
              </button>
            </div>
            <ResultsView data={analyseData} />
          </div>
        )}
      </div>
    </main>
  )
}
