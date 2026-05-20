export interface VacatureContext {
  functietitel: string
  bedrijfsnaam: string
  senioriteit: string
  sector: string
  salaris: string
  contract: string
}

export interface ExtractResult extends VacatureContext {
  ontbrekend: string[]
}

export interface CriteriumScore {
  score: number
  oordeel: 'goed' | 'matig' | 'zwak'
  toelichting: string
  tip: string
}

export interface Top3Item {
  titel: string
  probleem: string
  advies: string
}

export interface AnalyseResult {
  // Standaard 6
  perspectief: CriteriumScore
  wiifm: CriteriumScore
  inclusief: CriteriumScore
  b2niveau: CriteriumScore
  cta: CriteriumScore
  compleetheid: CriteriumScore
  // Extra 7
  rolToonMatch: CriteriumScore
  vindbaarheid: CriteriumScore
  knockOut: CriteriumScore
  onderscheidendVermogen: CriteriumScore
  employerBranding: CriteriumScore
  praktischeInfo: CriteriumScore
  toneOfVoice: CriteriumScore
  // Meta
  samenvatting: string
  top3: Top3Item[]
}

export interface AnalyseData {
  vacaturetekst: string
  context: VacatureContext
  analyse: AnalyseResult
}
