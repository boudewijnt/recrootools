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

    const systemPrompt = `Je bent een kritische expert in werving & selectie. Beoordeel vacatureteksten streng en realistisch. Een gemiddelde vacature scoort 4–6 op de meeste criteria. Geef altijd ALLEEN geldig JSON terug, zonder uitleg of inleiding.`

    const prompt = `Beoordeel deze vacaturetekst op 13 criteria. Wees kritisch en streng — de meeste vacatures falen op meerdere punten.

VACATURETEKST:
${vacaturetekst}

CONTEXT:
- Functietitel: ${context.functietitel}
- Bedrijf: ${context.bedrijfsnaam}
- Senioriteit: ${context.senioriteit}
- Sector: ${context.sector}
- Salaris: ${context.salaris}
- Contract: ${context.contract}

VERPLICHTE SCOREGRENZEN (deze zijn absoluut — overschrijd ze nooit):
1. perspectief: openingszin vanuit het bedrijf ("wij zoeken", "voor [bedrijf] zoeken we", "ons team zoekt") → score MAXIMAAL 5
2. wiifm: geen concreet salaris of salarisrange vermeld (huidig uit context: "${context.salaris}" — als dit leeg, onbekend of niet-vermeld is) → score MAXIMAAL 5
3. cta: alleen een sollicitatieknop zonder naam van contactpersoon of directe contactmogelijkheid → score MAXIMAAL 4
4. rolToonMatch: informele of juniortoon bij een senior- of directeursrol (senioriteit: ${context.senioriteit}) → score MAXIMAAL 4
5. onderscheidendVermogen: gebruik van generieke termen als "familiebedrijf", "ambitieus", "informeel", "gedreven", "no-nonsense", "dynamisch" zonder concreet bewijs of specifieke voorbeelden → score MAXIMAAL 4

RICHTLIJNEN PER CRITERIUM:
- perspectief: schrijft de tekst vanuit de kandidaat (jij-vorm, jouw voordelen) of vanuit het bedrijf?
- wiifm: welke concrete voordelen krijgt de kandidaat? (salaris, doorgroei, cultuur, flexibiliteit, extra's)
- inclusief: genderneutraal taalgebruik, geen onnodige uitsluitende eisen (bijv. onnodige diploma-eisen, overdreven ervaringseisen)
- b2niveau: is de tekst begrijpelijk op B2-niveau, passend bij de doelgroep in ${context.sector}?
- cta: is er een duidelijke, laagdrempelige sollicitatie-oproep inclusief contactpersoon of directe contactmogelijkheid?
- compleetheid: zijn functie, taken, eisen, arbeidsvoorwaarden en procedure volledig en logisch geordend beschreven?
- rolToonMatch: past de schrijftoon bij het senioriteitsniveau ${context.senioriteit}? (directeur/senior vereist professionele toon, junior mag informeler)
- vindbaarheid: is de locatie vermeld, is er een salarisrange, worden relevante zoektermen gebruikt die kandidaten intypen? Score hoog bij alle drie aanwezig, laag bij ontbrekende elementen.
- knockOut: zijn er onnodige drempelbarrières die goede kandidaten weghouden? Score hoog bij weinig/geen onnodige eisen, laag bij lange eisenlijsten of overdreven vereisten.
- onderscheidendVermogen: wat maakt deze vacature specifiek anders dan 100 vergelijkbare vacatures van concurrenten? Concreet en uniek = hoog, generiek = laag.
- employerBranding: is er een concreet en geloofwaardig bedrijfsverhaal? (missie met bewijs, cultuur met voorbeelden, concrete feiten — niet alleen loze claims)
- praktischeInfo: zijn contractvorm, startdatum, locatie en hybride/remote mogelijkheden duidelijk vermeld?
- toneOfVoice: past de schrijftoon bij de branche ${context.sector}? (tech = casual mag, finance/legal = formeel verwacht, zorg = warm en toegankelijk, etc.)

Geef ALLEEN geldig JSON terug in deze exacte structuur:
{
  "perspectief":            {"score":5,"oordeel":"matig","toelichting":"...","tip":"..."},
  "wiifm":                  {"score":4,"oordeel":"zwak","toelichting":"...","tip":"..."},
  "inclusief":              {"score":7,"oordeel":"goed","toelichting":"...","tip":"..."},
  "b2niveau":               {"score":6,"oordeel":"matig","toelichting":"...","tip":"..."},
  "cta":                    {"score":3,"oordeel":"zwak","toelichting":"...","tip":"..."},
  "compleetheid":           {"score":5,"oordeel":"matig","toelichting":"...","tip":"..."},
  "rolToonMatch":           {"score":6,"oordeel":"matig","toelichting":"...","tip":"..."},
  "vindbaarheid":           {"score":4,"oordeel":"zwak","toelichting":"...","tip":"..."},
  "knockOut":               {"score":5,"oordeel":"matig","toelichting":"...","tip":"..."},
  "onderscheidendVermogen": {"score":3,"oordeel":"zwak","toelichting":"...","tip":"..."},
  "employerBranding":       {"score":5,"oordeel":"matig","toelichting":"...","tip":"..."},
  "praktischeInfo":         {"score":6,"oordeel":"matig","toelichting":"...","tip":"..."},
  "toneOfVoice":            {"score":7,"oordeel":"goed","toelichting":"...","tip":"..."},
  "samenvatting": "2-3 zinnen overall beoordeling over alle 13 criteria",
  "top3": [
    {"titel":"...","probleem":"...","advies":"..."},
    {"titel":"...","probleem":"...","advies":"..."},
    {"titel":"...","probleem":"...","advies":"..."}
  ]
}

oordeel-regels: score >= 7 = "goed" | 5-6 = "matig" | < 5 = "zwak"
top3: kies de 3 criteria met de laagste score uit alle 13 — dit zijn de prioriteiten`

    const raw = await callClaude(prompt, systemPrompt, 4096)
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
