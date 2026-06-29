import {
  Document,
  Page,
  View,
  Text,
  Image,
  pdf,
  Font,
  Svg,
  Polygon,
  Rect as SvgRect,
} from '@react-pdf/renderer'
import path from 'path'
import type { AnalyseData, CriteriumScore } from './types'

Font.register({
  family: 'DM Sans',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'DMSans-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'DMSans-SemiBold.ttf'), fontWeight: 600 },
  ],
})

// ─── Afmetingen ───────────────────────────────────────────────────────────────
const PW  = 595.28
const MX  = 24
const H1  = 164
const H2  = 72
const BP  = 20
const GAP = 8
const BW  = PW - MX * 2
const CW  = (BW - GAP) / 2

// ─── Kleuren ──────────────────────────────────────────────────────────────────
const C = {
  green:      '#006f66',
  greenDark:  '#005a52',
  tealMid:    '#6895a2',
  tealLight:  '#7db4c3',
  orange:     '#e8902c',
  red:        '#c0392b',
  bgLight:    '#f2f7f8',
  border:     '#d0e2e6',
  textDark:   '#1a2e30',
  textMid:    '#3d5a5e',
  white:      '#ffffff',
  sage:       '#a0bfb9',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreKleur(score: number): string {
  return score >= 7 ? C.green : score >= 5 ? C.orange : C.red
}
function scoreLabel(score: number): string {
  return score >= 7 ? 'GOED' : score >= 5 ? 'MATIG' : 'ZWAK'
}
function truncate(tekst: string, max: number): string {
  return tekst.length > max ? tekst.slice(0, max) + '…' : tekst
}

// ─── Header pagina 1 (diagonaal) ─────────────────────────────────────────────
function Header1({ logoPath, datum, functietitel, bedrijfsnaam, gemiddelde }: {
  logoPath: string; datum: string; functietitel: string; bedrijfsnaam: string; gemiddelde: number
}) {
  const dTop = PW * 0.42
  const dBot = PW * 0.355
  return (
    <View style={{ height: H1, position: 'relative' }}>
      <Svg width={PW} height={H1} style={{ position: 'absolute', top: 0, left: 0 }}>
        <SvgRect x="0" y="0" width={PW} height={H1} fill={C.tealMid} />
        <Polygon points={`0,0 ${dTop},0 ${dBot},${H1} 0,${H1}`} fill={C.green} />
        <Polygon points={`${dTop},0 ${dBot},${H1} ${dTop},${H1}`} fill={C.greenDark} />
      </Svg>
      <View style={{ position: 'absolute', top: 16, left: MX, right: MX, flexDirection: 'row', alignItems: 'flex-start' }}>
        <Image src={logoPath} style={{ width: 125 }} />
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 8 }}>
          <View style={{ backgroundColor: C.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 }}>
            <Text style={{ color: C.white, fontSize: 7.5, fontWeight: 600, letterSpacing: 0.8 }}>
              OPTIMALISATIE MOGELIJK
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: C.greenDark, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', minWidth: 96 }}>
          <Text style={{ color: C.sage, fontSize: 6.5, letterSpacing: 0.8, marginBottom: 3 }}>HUIDIGE SCORE</Text>
          <Text style={{ color: C.white, fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{gemiddelde}%</Text>
          <Text style={{ color: C.sage, fontSize: 6.5, textAlign: 'center', marginTop: 4 }}>vacature{'\n'}kwaliteit</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 18, left: MX }}>
        <Text style={{ color: C.white, fontSize: 15, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>VACATURE ANALYSE</Text>
        <Text style={{ color: C.sage, fontSize: 8 }}>{datum}</Text>
        <Text style={{ color: C.white, fontSize: 8.5, marginTop: 2 }}>{functietitel}  ·  {bedrijfsnaam}</Text>
      </View>
    </View>
  )
}

// ─── Header pagina 2/3 (compact) ─────────────────────────────────────────────
function Header2({ logoPath, datum }: { logoPath: string; datum: string }) {
  return (
    <View style={{ height: H2, position: 'relative' }}>
      <Svg width={PW} height={H2} style={{ position: 'absolute', top: 0, left: 0 }}>
        <SvgRect x="0" y="0" width={PW} height={H2} fill={C.green} />
        <Polygon points={`${PW * 0.58},0 ${PW},0 ${PW},${H2} ${PW * 0.63},${H2}`} fill={C.tealMid} />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: MX }}>
        <Image src={logoPath} style={{ width: 90 }} />
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: C.white, fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>VACATURE ANALYSE</Text>
          <Text style={{ color: C.sage, fontSize: 8, marginTop: 3 }}>{datum}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Sectietitel ─────────────────────────────────────────────────────────────
function SectieKop({ children }: { children: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 10, fontWeight: 600, color: C.textDark, letterSpacing: 0.6, marginBottom: 5 }}>
        {children}
      </Text>
      <View style={{ height: 1.5, backgroundColor: C.tealMid }} />
    </View>
  )
}

// ─── Criterium-kaart ──────────────────────────────────────────────────────────
function CriteriumKaart({ naam, data, marginRight }: { naam: string; data: CriteriumScore; marginRight?: number }) {
  const kleur = scoreKleur(data.score)
  const label = scoreLabel(data.score)
  return (
    <View style={{ width: CW, borderWidth: 1, borderColor: kleur, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', marginRight: marginRight ?? 0, marginBottom: GAP }}>
      <View style={{ width: 3, backgroundColor: kleur }} />
      <View style={{ flex: 1, padding: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ flex: 1, fontSize: 8.5, fontWeight: 600, color: C.textDark, letterSpacing: 0.3 }}>{naam}</Text>
          <View style={{ backgroundColor: kleur, paddingHorizontal: 6, paddingVertical: 2.5, borderRadius: 3 }}>
            <Text style={{ color: C.white, fontSize: 6.5, fontWeight: 600 }}>{label} {data.score}/10</Text>
          </View>
        </View>
        <View style={{ height: 4, backgroundColor: C.border, borderRadius: 2, marginBottom: 7 }}>
          <View style={{ height: 4, width: `${data.score * 10}%`, backgroundColor: kleur, borderRadius: 2 }} />
        </View>
        <Text style={{ fontSize: 7.5, color: C.textMid, lineHeight: 1.45, marginBottom: 7 }}>
          {data.toelichting}
        </Text>
        <View style={{ backgroundColor: C.bgLight, borderRadius: 4, padding: 7 }}>
          <Text style={{ fontSize: 7.5, color: C.green, lineHeight: 1.4 }}>
            <Text style={{ fontWeight: 600 }}>Tip: </Text>
            {data.tip}
          </Text>
        </View>
      </View>
    </View>
  )
}

// ─── 2-kolom criteriaraster ───────────────────────────────────────────────────
function CriteriaGrid({ items }: { items: { naam: string; data: CriteriumScore }[] }) {
  const rijen = Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => i * 2)
  return (
    <View>
      {rijen.map(i => (
        <View key={i} wrap={false} style={{ flexDirection: 'row' }}>
          <CriteriumKaart naam={items[i].naam} data={items[i].data} marginRight={items[i + 1] ? GAP : 0} />
          {items[i + 1] && <CriteriumKaart naam={items[i + 1].naam} data={items[i + 1].data} />}
        </View>
      ))}
    </View>
  )
}

// ─── Hoofd PDF-component ──────────────────────────────────────────────────────
function VacatureAnalysePDF({ data }: { data: AnalyseData }) {
  const { context, analyse } = data
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  const allScores = [
    analyse.perspectief.score, analyse.wiifm.score, analyse.inclusief.score,
    analyse.b2niveau.score, analyse.cta.score, analyse.compleetheid.score,
    analyse.rolToonMatch.score, analyse.vindbaarheid.score, analyse.knockOut.score,
    analyse.onderscheidendVermogen.score, analyse.employerBranding.score,
    analyse.praktischeInfo.score, analyse.toneOfVoice.score,
  ]
  const gemiddelde     = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length * 10)
  const aantalGoed     = allScores.filter(s => s >= 7).length
  const aantalAandacht = allScores.filter(s => s < 7).length

  const standaard = [
    { naam: 'Perspectief',    data: analyse.perspectief },
    { naam: 'WIIFM',          data: analyse.wiifm },
    { naam: 'Inclusief',      data: analyse.inclusief },
    { naam: 'B2-Niveau',      data: analyse.b2niveau },
    { naam: 'Call to Action', data: analyse.cta },
    { naam: 'Compleetheid',   data: analyse.compleetheid },
  ]

  const extra = [
    { naam: 'Rol-Toon Match',           data: analyse.rolToonMatch },
    { naam: 'Vindbaarheid (SEO)',        data: analyse.vindbaarheid },
    { naam: 'Knock-outeisen',           data: analyse.knockOut },
    { naam: 'Onderscheidend Vermogen',  data: analyse.onderscheidendVermogen },
    { naam: 'Employer Branding',        data: analyse.employerBranding },
    { naam: 'Praktische Info',          data: analyse.praktischeInfo },
    { naam: 'Tone-of-Voice',            data: analyse.toneOfVoice },
  ]

  const prioriteitKleuren = [
    { bg: '#fde8e7', blok: C.red },
    { bg: '#fdf3e7', blok: C.orange },
    { bg: '#e8f5f3', blok: C.green },
  ]

  return (
    <Document title={`Vacature Analyse ${context.functietitel} - ${context.bedrijfsnaam}`}>

      {/* ══ PAGINA 1 — Standaard 6 criteria ════════════════════════════════════ */}
      <Page size="A4" style={{ fontFamily: 'DM Sans', backgroundColor: C.white }}>
        <Header1 logoPath={logoPath} datum={datum} functietitel={context.functietitel} bedrijfsnaam={context.bedrijfsnaam} gemiddelde={gemiddelde} />
        <View style={{ paddingHorizontal: MX, paddingTop: BP, paddingBottom: BP }}>
          {/* Kort en goed */}
          <View style={{ flexDirection: 'row', backgroundColor: C.bgLight, borderRadius: 6, marginBottom: 16, overflow: 'hidden' }}>
            <View style={{ width: 4, backgroundColor: C.green }} />
            <View style={{ flex: 1, padding: 12 }}>
              <Text style={{ fontSize: 8.5, fontWeight: 600, color: C.green, letterSpacing: 0.6, marginBottom: 5 }}>KORT EN GOED</Text>
              <Text style={{ fontSize: 9.5, color: C.textMid, lineHeight: 1.5 }}>{analyse.samenvatting}</Text>
            </View>
          </View>
          <SectieKop>1. BASISANALYSE — 6 STANDAARD CRITERIA</SectieKop>
          <CriteriaGrid items={standaard} />
        </View>
      </Page>

      {/* ══ PAGINA 2 — Extra 7 criteria ════════════════════════════════════════ */}
      <Page size="A4" style={{ fontFamily: 'DM Sans', backgroundColor: C.white }}>
        <Header2 logoPath={logoPath} datum={datum} />
        <View style={{ paddingHorizontal: MX, paddingTop: BP, paddingBottom: BP }}>
          <SectieKop>2. UITGEBREIDE ANALYSE — 7 EXTRA CRITERIA</SectieKop>
          <CriteriaGrid items={extra} />
        </View>
      </Page>

      {/* ══ PAGINA 3 — Top 3 + totaalscore ════════════════════════════════════ */}
      <Page size="A4" style={{ fontFamily: 'DM Sans', backgroundColor: C.white }}>
        <Header2 logoPath={logoPath} datum={datum} />
        <View style={{ paddingHorizontal: MX, paddingTop: BP, paddingBottom: BP }}>
          <SectieKop>TOP 3 PRIORITEITEN</SectieKop>

          {analyse.top3.map((item, i) => {
            const k = prioriteitKleuren[i] ?? prioriteitKleuren[2]
            return (
              <View key={i} style={{ flexDirection: 'row', backgroundColor: k.bg, borderRadius: 6, marginBottom: 14, overflow: 'hidden' }}>
                <View style={{ width: 44, backgroundColor: k.blok, justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }}>
                  <Text style={{ color: C.white, fontSize: 15, fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1, padding: 14 }}>
                  <Text style={{ fontSize: 10, fontWeight: 600, color: C.textDark, marginBottom: 5 }}>{item.titel}</Text>
                  <Text style={{ fontSize: 8.5, color: C.textMid, lineHeight: 1.4, marginBottom: 4 }}>
                    <Text style={{ fontWeight: 600, color: C.textDark }}>Probleem: </Text>{item.probleem}
                  </Text>
                  <Text style={{ fontSize: 8.5, lineHeight: 1.4 }}>
                    <Text style={{ fontWeight: 600, color: k.blok }}>Advies: </Text>
                    <Text style={{ color: C.textMid }}>{item.advies}</Text>
                  </Text>
                </View>
              </View>
            )
          })}

          {/* Totaalscore balk */}
          <View style={{ backgroundColor: C.green, borderRadius: 8, padding: 18, flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontSize: 24, fontWeight: 600 }}>{gemiddelde}%</Text>
              <Text style={{ color: C.sage, fontSize: 8, marginTop: 3 }}>Gemiddelde score</Text>
              <Text style={{ color: C.sage, fontSize: 7, marginTop: 1 }}>over 13 criteria</Text>
            </View>
            <View style={{ width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontSize: 24, fontWeight: 600 }}>{aantalGoed}</Text>
              <Text style={{ color: C.sage, fontSize: 8, marginTop: 3 }}>Criteria goed</Text>
            </View>
            <View style={{ width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: C.white, fontSize: 24, fontWeight: 600 }}>{aantalAandacht}</Text>
              <Text style={{ color: C.sage, fontSize: 8, marginTop: 3 }}>Aandachtspunten</Text>
            </View>
          </View>
        </View>
      </Page>

    </Document>
  )
}

export async function generatePDF(data: AnalyseData): Promise<Buffer> {
  const element = <VacatureAnalysePDF data={data} />
  const instance = pdf(element)
  const blob = await instance.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
