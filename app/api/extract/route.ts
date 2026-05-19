import { NextRequest } from 'next/server'
import { callClaude, parseJSON } from '@/lib/claude'
import type { ExtractResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { vacaturetekst } = await request.json()

    if (!vacaturetekst?.trim()) {
      return Response.json({ error: 'Vacaturetekst is verplicht' }, { status: 400 })
    }

    const prompt = `Lees deze vacaturetekst en extraheer wat je kunt. Geef ALLEEN geldig JSON terug, geen uitleg:

${vacaturetekst}

JSON-formaat:
{
  "functietitel": "of onbekend",
  "bedrijfsnaam": "of onbekend",
  "senioriteit": "Starter/Junior of Medior of Senior of Lead/Manager of Directeur/C-level of onbekend",
  "sector": "Techniek & Industrie of IT & Tech of Zorg of Finance of Overheid of Retail & FMCG of Anders of onbekend",
  "salaris": "range of niet vermeld",
  "contract": "Vast of Tijdelijk of Freelance of Stage of niet vermeld",
  "ontbrekend": ["lijst van velden die niet bepaald konden worden"]
}`

    const raw = await callClaude(prompt)
    const result = parseJSON<ExtractResult>(raw)

    return Response.json(result)
  } catch (error) {
    console.error('Extract fout:', error)
    return Response.json(
      { error: 'Kon de vacaturetekst niet analyseren. Probeer het opnieuw.' },
      { status: 500 }
    )
  }
}
