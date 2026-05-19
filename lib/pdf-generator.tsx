import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
  Font,
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

const COLORS = {
  groen: '#006f66',
  tealLicht: '#7db4c3',
  tealMidden: '#6895a2',
  sage: '#a0bfb9',
  grijs: '#9ba3a9',
  oranje: '#e8902c',
  rood: '#c0392b',
  achtergrond: '#f2f7f8',
  tekstDonker: '#1a2e30',
  tekstMidden: '#3d5a5e',
  wit: '#ffffff',
}

function scoreKleur(score: number): string {
  if (score >= 7) return COLORS.groen
  if (score >= 5) return COLORS.oranje
  return COLORS.rood
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'DM Sans',
    backgroundColor: COLORS.wit,
    padding: 0,
  },
  header: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: COLORS.groen,
  },
  headerLogo: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.wit,
    fontSize: 20,
    fontWeight: 600,
  },
  headerSubtitle: {
    color: COLORS.sage,
    fontSize: 10,
    marginTop: 4,
  },
  scoreTegel: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreGroot: {
    color: COLORS.wit,
    fontSize: 32,
    fontWeight: 600,
  },
  scoreLabel: {
    color: COLORS.sage,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  body: {
    padding: 32,
    flex: 1,
  },
  samenvattingBox: {
    backgroundColor: COLORS.achtergrond,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.groen,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  samenvattingTitel: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.groen,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  samenvattingTekst: {
    fontSize: 10,
    color: COLORS.tekstMidden,
    lineHeight: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  criteriumTegel: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  criteriumKleurstreep: {
    height: 4,
  },
  criteriumInner: {
    padding: 12,
  },
  criteriumNaamRij: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  criteriumNaam: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.tekstDonker,
    textTransform: 'uppercase',
    flex: 1,
  },
  criteriumBadge: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.wit,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.achtergrond,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  toelichting: {
    fontSize: 9,
    color: COLORS.tekstMidden,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  tipBox: {
    backgroundColor: '#e8f5f3',
    padding: 8,
    borderRadius: 6,
  },
  tipTekst: {
    fontSize: 9,
    color: COLORS.groen,
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: COLORS.tekstDonker,
    marginBottom: 16,
  },
  prioriteitKaart: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.achtergrond,
  },
  prioriteitNummer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  prioriteitNummerTekst: {
    color: COLORS.wit,
    fontSize: 18,
    fontWeight: 600,
  },
  prioriteitContent: {
    flex: 1,
    padding: 14,
  },
  prioriteitTitel: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.tekstDonker,
    marginBottom: 4,
  },
  prioriteitProbleem: {
    fontSize: 9,
    color: COLORS.tekstMidden,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  prioriteitAdvies: {
    fontSize: 9,
    color: COLORS.groen,
    lineHeight: 1.4,
    fontWeight: 600,
  },
  scoreSamenvattingBalk: {
    flexDirection: 'row',
    backgroundColor: COLORS.achtergrond,
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  scoreStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreStatGetal: {
    fontSize: 24,
    fontWeight: 600,
    color: COLORS.tekstDonker,
  },
  scoreStatLabel: {
    fontSize: 9,
    color: COLORS.grijs,
    textAlign: 'center',
    marginTop: 4,
  },
  scoreStatScheidslijn: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 32,
    fontSize: 9,
    color: COLORS.grijs,
  },
  datum: {
    fontSize: 9,
    color: COLORS.sage,
    marginTop: 4,
  },
})

function CriteriumTegel({ naam, data }: { naam: string; data: CriteriumScore }) {
  const kleur = scoreKleur(data.score)
  const maxChars = 180
  const toelichting = data.toelichting.length > maxChars
    ? data.toelichting.slice(0, maxChars) + '…'
    : data.toelichting

  return (
    <View style={[styles.criteriumTegel, { borderColor: kleur }]}>
      <View style={[styles.criteriumKleurstreep, { backgroundColor: kleur }]} />
      <View style={styles.criteriumInner}>
        <View style={styles.criteriumNaamRij}>
          <Text style={styles.criteriumNaam}>{naam}</Text>
          <Text style={[styles.criteriumBadge, { backgroundColor: kleur }]}>
            {data.oordeel} · {data.score}/10
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: kleur, width: `${data.score * 10}%` },
            ]}
          />
        </View>
        <Text style={styles.toelichting}>{toelichting}</Text>
        <View style={styles.tipBox}>
          <Text style={styles.tipTekst}>Tip: {data.tip}</Text>
        </View>
      </View>
    </View>
  )
}

const PRIORITEIT_KLEUREN = [COLORS.rood, COLORS.oranje, COLORS.tealMidden]

function VacatureAnalysePDF({ data }: { data: AnalyseData }) {
  const { context, analyse } = data
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const datum = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const scores = [
    analyse.perspectief.score,
    analyse.wiifm.score,
    analyse.inclusief.score,
    analyse.b2niveau.score,
    analyse.cta.score,
    analyse.compleetheid.score,
  ]
  const gemiddelde = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const aantalGoed = scores.filter(s => s >= 7).length
  const aantalAandacht = scores.filter(s => s < 5).length

  const criteria: Array<{ naam: string; data: CriteriumScore }> = [
    { naam: 'Perspectief', data: analyse.perspectief },
    { naam: 'WIIFM', data: analyse.wiifm },
    { naam: 'Inclusief', data: analyse.inclusief },
    { naam: 'B2-niveau', data: analyse.b2niveau },
    { naam: 'Call to action', data: analyse.cta },
    { naam: 'Compleetheid', data: analyse.compleetheid },
  ]

  return (
    <Document title={`Vacature Analyse ${context.functietitel} - ${context.bedrijfsnaam}`}>
      {/* Pagina 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoPath} style={styles.headerLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Vacature Analyse</Text>
            <Text style={styles.headerSubtitle}>
              {context.functietitel} · {context.bedrijfsnaam}
            </Text>
            <Text style={styles.datum}>{datum}</Text>
          </View>
          <View style={styles.scoreTegel}>
            <Text style={styles.scoreGroot}>{gemiddelde * 10}%</Text>
            <Text style={styles.scoreLabel}>Gemiddelde{'\n'}score</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.samenvattingBox}>
            <Text style={styles.samenvattingTitel}>Kort & goed</Text>
            <Text style={styles.samenvattingTekst}>{analyse.samenvatting}</Text>
          </View>

          <View style={styles.grid}>
            {criteria.map((c) => (
              <CriteriumTegel key={c.naam} naam={c.naam} data={c.data} />
            ))}
          </View>
        </View>

        <Text style={styles.pageNumber}>1</Text>
      </Page>

      {/* Pagina 2 */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { height: 72 }]}>
          <Image src={logoPath} style={[styles.headerLogo, { width: 36, height: 36 }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Top 3 prioriteiten</Text>
            <Text style={styles.headerSubtitle}>{datum}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>De 3 belangrijkste verbeterpunten</Text>

          {analyse.top3.map((item, i) => (
            <View key={i} style={styles.prioriteitKaart}>
              <View style={[styles.prioriteitNummer, { backgroundColor: PRIORITEIT_KLEUREN[i] }]}>
                <Text style={styles.prioriteitNummerTekst}>{i + 1}</Text>
              </View>
              <View style={styles.prioriteitContent}>
                <Text style={styles.prioriteitTitel}>{item.titel}</Text>
                <Text style={styles.prioriteitProbleem}>{item.probleem}</Text>
                <Text style={styles.prioriteitAdvies}>Advies: {item.advies}</Text>
              </View>
            </View>
          ))}

          <View style={styles.scoreSamenvattingBalk}>
            <View style={styles.scoreStatItem}>
              <Text style={[styles.scoreStatGetal, { color: COLORS.groen }]}>{gemiddelde * 10}%</Text>
              <Text style={styles.scoreStatLabel}>Gemiddelde score</Text>
            </View>
            <View style={styles.scoreStatScheidslijn} />
            <View style={styles.scoreStatItem}>
              <Text style={[styles.scoreStatGetal, { color: COLORS.groen }]}>{aantalGoed}</Text>
              <Text style={styles.scoreStatLabel}>Criteria goed</Text>
            </View>
            <View style={styles.scoreStatScheidslijn} />
            <View style={styles.scoreStatItem}>
              <Text style={[styles.scoreStatGetal, { color: COLORS.rood }]}>{aantalAandacht}</Text>
              <Text style={styles.scoreStatLabel}>Aandachtspunten</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageNumber}>2</Text>
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
