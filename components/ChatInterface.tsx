'use client'

import { useState, useRef, useEffect } from 'react'
import type { ExtractResult, VacatureContext } from '@/lib/types'

interface Bericht {
  rol: 'agent' | 'gebruiker'
  tekst: string
}

const VELD_LABELS: Record<string, string> = {
  functietitel: 'functietitel',
  bedrijfsnaam: 'bedrijfsnaam',
  senioriteit: 'senioriteitsniveau',
  sector: 'sector',
  salaris: 'salaris of salarisbereik',
  contract: 'contractvorm',
}

const VELD_OPTIES: Record<string, string[]> = {
  senioriteit: ['Starter/Junior', 'Medior', 'Senior', 'Lead/Manager', 'Directeur/C-level'],
  sector: ['Techniek & Industrie', 'IT & Tech', 'Zorg', 'Finance', 'Overheid', 'Retail & FMCG', 'Anders'],
  contract: ['Vast', 'Tijdelijk', 'Freelance', 'Stage'],
}

interface Props {
  extract: ExtractResult
  onKlaar: (context: VacatureContext) => void
}

export default function ChatInterface({ extract, onKlaar }: Props) {
  const [berichten, setBerichten] = useState<Bericht[]>([])
  const [input, setInput] = useState('')
  const [typen, setTypen] = useState(false)
  const [huidigVeld, setHuidigVeld] = useState<string | null>(null)
  const [context, setContext] = useState<VacatureContext>({
    functietitel: extract.functietitel,
    bedrijfsnaam: extract.bedrijfsnaam,
    senioriteit: extract.senioriteit,
    sector: extract.sector,
    salaris: extract.salaris,
    contract: extract.contract,
  })
  const [ontbrekendQueue, setOntbrekendQueue] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten, typen])

  useEffect(() => {
    init()
  }, [])

  async function voegAgentBerichtToe(tekst: string) {
    setTypen(true)
    await new Promise((r) => setTimeout(r, 600))
    setTypen(false)
    setBerichten((prev) => [...prev, { rol: 'agent', tekst }])
  }

  async function init() {
    const gevonden: string[] = []
    const onbekend: string[] = []

    const velden = ['functietitel', 'bedrijfsnaam', 'senioriteit', 'sector', 'salaris', 'contract']
    for (const v of velden) {
      const waarde = extract[v as keyof ExtractResult] as string
      if (waarde && waarde !== 'onbekend' && waarde !== 'niet vermeld') {
        gevonden.push(`${VELD_LABELS[v]}: **${waarde}**`)
      } else {
        onbekend.push(v)
      }
    }

    let bericht = 'Ik heb de vacaturetekst gelezen.'
    if (gevonden.length > 0) {
      bericht += ` Dit heb ik gevonden:\n\n${gevonden.join('\n')}`
    }

    await voegAgentBerichtToe(bericht)

    const teVragen = onbekend.slice(0, 4)
    setOntbrekendQueue(teVragen.slice(1))

    if (teVragen.length > 0) {
      await stelVraag(teVragen[0], context, teVragen.slice(1))
    } else {
      await voegAgentBerichtToe(
        'Alles is ingevuld. Klik op "Analyseer vacature" om de volledige analyse te starten.'
      )
    }
  }

  async function stelVraag(veld: string, huidigContext: VacatureContext, resterend: string[]) {
    setHuidigVeld(veld)
    setOntbrekendQueue(resterend)
    const label = VELD_LABELS[veld] ?? veld
    const opties = VELD_OPTIES[veld]

    let vraag = `Wat is de ${label} voor deze vacature?`
    if (opties) {
      vraag += `\n\nKies uit: ${opties.join(', ')}`
    }

    await voegAgentBerichtToe(vraag)
  }

  async function verwerkAntwoord(antwoord: string) {
    if (!huidigVeld) return

    const nieuweContext = { ...context, [huidigVeld]: antwoord }
    setContext(nieuweContext)
    setHuidigVeld(null)

    setBerichten((prev) => [...prev, { rol: 'gebruiker', tekst: antwoord }])

    if (ontbrekendQueue.length > 0) {
      const [volgende, ...rest] = ontbrekendQueue
      await stelVraag(volgende, nieuweContext, rest)
    } else {
      await voegAgentBerichtToe(
        'Bedankt! Alle informatie is compleet. Klik op "Analyseer vacature" om verder te gaan.'
      )
    }
  }

  async function handleVerstuur(e: React.FormEvent) {
    e.preventDefault()
    const tekst = input.trim()
    if (!tekst || !huidigVeld) return
    setInput('')
    await verwerkAntwoord(tekst)
  }

  function handleOptieKlik(optie: string) {
    if (!huidigVeld) return
    setInput('')
    verwerkAntwoord(optie)
  }

  const klaarMetVragen = !huidigVeld && berichten.length > 0 && !typen

  return (
    <div className="flex flex-col h-full">
      {/* Context tabel */}
      <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>
            Gevonden context
          </p>
        </div>
        <div>
          {Object.entries(context).map(([k, v], idx) => (
            <div key={k} className="flex px-4 py-2" style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--color-border)' }}>
              <span className="text-xs w-32 shrink-0" style={{ color: 'var(--color-muted)' }}>
                {VELD_LABELS[k] ?? k}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: v && v !== 'onbekend' && v !== 'niet vermeld' ? 'var(--color-text)' : 'var(--color-muted)' }}
              >
                {v || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat berichten */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
        {berichten.map((b, i) => (
          <div key={i} className={`flex gap-2 ${b.rol === 'gebruiker' ? 'justify-end' : 'justify-start'}`}>
            {b.rol === 'agent' && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                style={{ backgroundColor: '#006f66' }}
              >
                AI
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line"
              style={{
                backgroundColor: b.rol === 'agent' ? 'var(--color-surface)' : 'var(--color-accent)',
                color: b.rol === 'agent' ? 'var(--color-text)' : '#ffffff',
                borderBottomLeftRadius: b.rol === 'agent' ? 4 : undefined,
                borderBottomRightRadius: b.rol === 'gebruiker' ? 4 : undefined,
              }}
            >
              {b.tekst}
            </div>
          </div>
        ))}

        {typen && (
          <div className="flex gap-2 justify-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: '#006f66' }}
            >
              AI
            </div>
            <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ backgroundColor: 'var(--color-surface)', borderBottomLeftRadius: 4 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: '#9ba3a9', animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Opties knoppen */}
        {huidigVeld && VELD_OPTIES[huidigVeld] && !typen && (
          <div className="flex flex-wrap gap-2 pl-9">
            {VELD_OPTIES[huidigVeld].map((opt) => (
              <button
                key={opt}
                onClick={() => handleOptieKlik(opt)}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-transparent hover:text-white"
                style={{ borderColor: '#006f66', color: '#006f66' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#006f66'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#006f66'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {huidigVeld && !VELD_OPTIES[huidigVeld] && (
        <form onSubmit={handleVerstuur} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Typ je antwoord…"
            className="flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none"
            style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: '#006f66' }}
          >
            Stuur
          </button>
        </form>
      )}

      {klaarMetVragen && (
        <button
          onClick={() => onKlaar(context)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#006f66' }}
        >
          Analyseer vacature →
        </button>
      )}
    </div>
  )
}
