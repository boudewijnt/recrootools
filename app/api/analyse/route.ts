import { NextRequest } from 'next/server'
import { callClaude, parseJSON } from '@/lib/claude'
import type { AnalyseResult, VacatureContext } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { vacaturetekst, context }: { vacaturetekst: string; context: VacatureContext } =
      await request.json()

    if (!vacaturetekst?.trim() || !context) {
      return Response.json({ error: 'Vacaturetekst en context zijn verplicht' }, { status: 400 })
    }

    const systemPrompt = `Je bent een expert in werving & selectie. Beoordeel vacatureteksten objectief en geef altijd ALLEEN geldig JSON terug, zonder uitleg of inleiding.`

    const prompt = `Beoordeel deze vacaturetekst op 6 criteria. Gebruik de context actief in je beoordeling.

VACATURETEKST:
${vacaturetekst}

CONTEXT:
- Functietitel: ${context.functietitel}
- Bedrijf: ${context.bedrijfsnaam}
- Senioriteit: ${context.senioriteit}
- Sector: ${context.sector}
- Salaris: ${context.salaris}
- Contract: ${context.contract}

Geef ALLEEN geldig JSON terug in deze exacte structuur:
{
  "perspectief":  {"score":7,"oordeel":"goed","toelichting":"...","tip":"..."},
  "wiifm":        {"score":5,"oordeel":"matig","toelichting":"...","tip":"..."},
  "inclusief":    {"score":7,"oordeel":"goed","toelichting":"...","tip":"..."},
  "b2niveau":     {"score":8,"oordeel":"goed","toelichting":"...","tip":"..."},
  "cta":          {"score":3,"oordeel":"zwak","toelichting":"...","tip":"..."},
  "compleetheid": {"score":6,"oordeel":"matig","toelichting":"...","tip":"..."},
  "samenvatting": "2-3 zinnen overall beoordeling",
  "top3": [
    {"titel":"...","probleem":"...","advies":"..."},
    {"titel":"...","probleem":"...","advies":"..."},
    {"titel":"...","probleem":"...","advies":"..."}
  ]
}

Richtlijnen per criterium:
- perspectief: kandidaat- vs bedrijfsgericht (jij-vorm = goed)
- wiifm (What's In It For Me): voordelen voor kandidaat — trek punten af als salaris ontbreekt (salaris: ${context.salaris})
- inclusief: gender-neutraal taalgebruik, geen onnodige uitsluitende eisen
- b2niveau: begrijpelijkheid én aansluiting bij niveau ${context.senioriteit} in sector ${context.sector} — een directeur-rol met junior-toon is zwak
- cta: duidelijke, laagdrempelige sollicitatie-oproep aanwezig
- compleetheid: alle relevante info aanwezig en logisch geordend

oordeel-regels: score >= 7 = "goed" | 5-6 = "matig" | < 5 = "zwak"`

    const raw = await callClaude(prompt, systemPrompt)
    const result = parseJSON<AnalyseResult>(raw)

    return Response.json(result)
  } catch (error) {
    console.error('Analyse fout:', error)
    return Response.json(
      { error: 'Analyse mislukt. Controleer de invoer en probeer het opnieuw.' },
      { status: 500 }
    )
  }
}
