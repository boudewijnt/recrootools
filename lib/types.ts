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
  perspectief: CriteriumScore
  wiifm: CriteriumScore
  inclusief: CriteriumScore
  b2niveau: CriteriumScore
  cta: CriteriumScore
  compleetheid: CriteriumScore
  samenvatting: string
  top3: Top3Item[]
}

export interface AnalyseData {
  vacaturetekst: string
  context: VacatureContext
  analyse: AnalyseResult
}
