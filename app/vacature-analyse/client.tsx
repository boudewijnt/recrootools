'use client'

import { useState } from 'react'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import ResultsView from '@/components/ResultsView'
import type { ExtractResult, VacatureContext, AnalyseResult, AnalyseData } from '@/lib/types'

type Stap = 'invoer' | 'context' | 'laden' | 'resultaat'

export default function VacatureAnalyseClient() {
  const [stap, setStap] = useState<Stap>('invoer')
  const [vacaturetekst, setVacaturetekst] = useState('')
  const [extract, setExtract] = useState<ExtractResult | null>(null)
  const [analyseData, setAnalyseData] = useState<AnalyseData | null>(null)
  const [fout, setFout] = useState<string | null>(null)
  const [extraheert, setExtraheert] = useState(false)

  async function handleAnalyseer() {
    if (!vacaturetekst.trim()) return
    setFout(null)
    setExtraheert(true)

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacaturetekst }),
      })
      if (!res.ok) throw new Error('Extractie mislukt')
      const data: ExtractResult = await res.json()
      setExtract(data)
      setStap('context')
    } catch {
      setFout('Kon de vacaturetekst niet analyseren. Controleer de tekst en probeer opnieuw.')
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
      if (!res.ok) throw new Error('Analyse mislukt')
      const analyse: AnalyseResult = await res.json()
      setAnalyseData({ vacaturetekst, context, analyse })
      setStap('resultaat')
    } catch {
      setFout('De analyse is mislukt. Probeer het opnieuw.')
      setStap('context')
    }
  }

  function opnieuw() {
    setStap('invoer')
    setVacaturetekst('')
    setExtract(null)
    setAnalyseData(null)
    setFout(null)
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="px-8 py-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
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
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {stap === 'invoer' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-2" style={{ color: '#1a2e30' }}>
              Vacature analyseren
            </h1>
            <p className="text-sm mb-8" style={{ color: '#9ba3a9' }}>
              Plak een vacaturetekst en ontvang een gedetailleerde analyse op 6 criteria.
            </p>

            <textarea
              value={vacaturetekst}
              onChange={(e) => setVacaturetekst(e.target.value)}
              placeholder="Plak hier de volledige vacaturetekst…"
              className="w-full h-64 text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:border-[#006f66] transition-colors"
              style={{ color: '#1a2e30' }}
            />

            {fout && (
              <p className="text-sm mt-3" style={{ color: '#c0392b' }}>{fout}</p>
            )}

            <button
              onClick={handleAnalyseer}
              disabled={!vacaturetekst.trim() || extraheert}
              className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#006f66' }}
            >
              {extraheert ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Tekst lezen…
                </span>
              ) : (
                'Analyseer'
              )}
            </button>
          </div>
        )}

        {stap === 'context' && extract && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: '#1a2e30' }}>
              Context bevestigen
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9ba3a9' }}>
              Controleer de gevonden informatie en beantwoord eventuele vragen.
            </p>

            {fout && (
              <p className="text-sm mb-4" style={{ color: '#c0392b' }}>{fout}</p>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ minHeight: 400 }}>
              <ChatInterface extract={extract} onKlaar={handleContextKlaar} />
            </div>
          </div>
        )}

        {stap === 'laden' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin w-10 h-10 border-4 border-gray-100 rounded-full" style={{ borderTopColor: '#006f66' }} />
            <p className="text-sm" style={{ color: '#9ba3a9' }}>Vacature wordt geanalyseerd…</p>
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
