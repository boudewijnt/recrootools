# Vacature Analyse Tool — Briefing voor Claude Code

## Doel
Bouw een Next.js webapplicatie die vacatureteksten analyseert via de Claude API
en een PDF-rapport genereert in huisstijl. De app draait op een bestaand 
Vercel-project met gekoppeld eigen domein.

---

## Tech stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **PDF generatie:** @react-pdf/renderer (serverside)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Mail (later toe te voegen):** Microsoft Graph API via O365
- **Deploy:** Vercel

---

## Environment Variables (in Vercel instellen)
```
ANTHROPIC_API_KEY=sk-ant-...
```
Later toe te voegen:
```
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_TENANT_ID=...
```

---

## Gebruikersflow

### Stap 1 — Vacaturetekst invoeren
- Grote textarea waar gebruiker de volledige vacaturetekst plakt
- Knop "Analyseer"

### Stap 2 — Context extraheren + vragen stellen
- App roept `/api/extract` aan met de vacaturetekst
- Claude extraheert automatisch wat in de tekst staat:
  - functietitel
  - bedrijfsnaam  
  - senioriteitsniveau (Starter/Junior | Medior | Senior | Lead/Manager | Directeur/C-level)
  - sector (Techniek & Industrie | IT & Tech | Zorg | Finance | Overheid | Retail & FMCG | Anders)
  - salaris (range of "niet vermeld")
  - contractvorm (Vast | Tijdelijk | Freelance | Stage | "niet vermeld")
- Wat ontbreekt, vraagt de app via een chatinterface op — maximaal 4 vragen, één voor één
- Gevonden waarden worden alvast getoond zodat de gebruiker ze kan corrigeren

### Stap 3 — Analyse uitvoeren
- Na bevestiging roept app `/api/analyse` aan met alle context
- Claude analyseert en geeft JSON terug (zie JSON-structuur hieronder)
- Resultaten worden getoond als rapport op de pagina

### Stap 4 — PDF downloaden
- Knop "Download rapport" roept `/api/pdf` aan
- PDF wordt gegenereerd in huisstijl en gedownload

---

## API Routes

### POST /api/extract
**Input:**
```json
{ "vacaturetekst": "..." }
```
**Claude prompt:**
```
Lees deze vacaturetekst en extraheer wat je kunt. Geef ALLEEN geldig JSON:
{
  "functietitel": "of onbekend",
  "bedrijfsnaam": "of onbekend",
  "senioriteit": "Starter/Junior|Medior|Senior|Lead/Manager|Directeur/C-level of onbekend",
  "sector": "sector of onbekend",
  "salaris": "range of niet vermeld",
  "contract": "Vast|Tijdelijk|Freelance|Stage of niet vermeld",
  "ontbrekend": ["lijst van velden die niet bepaald konden worden"]
}
```

### POST /api/analyse
**Input:**
```json
{
  "vacaturetekst": "...",
  "context": {
    "functietitel": "...",
    "bedrijfsnaam": "...",
    "senioriteit": "...",
    "sector": "...",
    "salaris": "...",
    "contract": "..."
  }
}
```

**Claude prompt:**
```
Je bent een expert in werving & selectie. Beoordeel de vacaturetekst op 
6 criteria. Gebruik de context actief in je beoordeling.
Geef ALLEEN geldig JSON terug in deze structuur:

{
  "perspectief":    {"score":7,"oordeel":"goed","toelichting":"...","tip":"..."},
  "wiifm":          {"score":5,"oordeel":"matig","toelichting":"...","tip":"..."},
  "inclusief":      {"score":7,"oordeel":"goed","toelichting":"...","tip":"..."},
  "b2niveau":       {"score":8,"oordeel":"goed","toelichting":"...","tip":"..."},
  "cta":            {"score":3,"oordeel":"zwak","toelichting":"...","tip":"..."},
  "compleetheid":   {"score":6,"oordeel":"matig","toelichting":"...","tip":"..."},
  "samenvatting":   "2-3 zinnen overall beoordeling",
  "top3": [
    {"titel":"...","probleem":"...","advies":"..."},
    {"titel":"...","probleem":"...","advies":"..."},
    {"titel":"...","probleem":"...","advies":"..."}
  ]
}

Richtlijnen:
- perspectief: kandidaat- vs bedrijfsgericht (jij-vorm = goed)
- wiifm: voordelen voor kandidaat — trek punten af als salaris ontbreekt
  (opgegeven salaris: {salaris})
- inclusief: gender-neutraal, geen onnodige uitsluitende eisen
- b2niveau: begrijpelijkheid én aansluiting bij niveau {senioriteit} 
  in sector {sector} — een directeur-rol met junior-toon is zwak
- cta: duidelijke, laagdrempelige sollicitatie-oproep
- compleetheid: alle info aanwezig en logisch geordend

oordeel: score >= 7 = goed | 5-6 = matig | < 5 = zwak
```

### POST /api/pdf
**Input:** volledige analysedata als JSON (zie structuur hierboven)  
**Output:** PDF-bestand als download

---

## PDF-rapport opmaak

### Huisstijl kleuren
```
Primair groen (deep):  #006f66
Teal licht:            #7db4c3
Teal midden:           #6895a2
Sage groen:            #a0bfb9
Grijs:                 #9ba3a9
Oranje accent:         #e8902c
Rood:                  #c0392b
Achtergrond licht:     #f2f7f8
Tekst donker:          #1a2e30
Tekst midden:          #3d5a5e
```

### Logo
Bestand: `public/logo.png` (PNG met transparante achtergrond)
Het logo is een P-vorm in teal/groen verloop met zwarte woordmark.
Zwarte pixels in het origineel zijn de achtergrond — gebruik mask='auto' 
of verwijder zwarte pixels bij verwerking.

### PDF structuur (3 pagina's)

**Pagina 1 — Header + Standaard criteria**
- Header: donkergroen (#006f66) links, teal (#6895a2) rechts, 
  diagonale overgang
- Logo linksboven (transparant op gekleurde achtergrond)
- Oranje badge "OPTIMALISATIE MOGELIJK" gecentreerd in header,
  bovenkant uitgelijnd met logo en score-tegel
- Score-tegel rechts: score als percentage (bijv. "62%"), 
  ondertitel met terugloop, alle content verticaal gecentreerd
- "Kort en goed" samenvattingsbox met groene linkerbalk
- Grid van 6 criterium-tegels (2 kolommen):
  - Tegel rand volledig in scoreклeur (groen/oranje/rood)
  - Links kleurstreep
  - Naam + badge (oordeel + score) — badge verticaal gecentreerd
  - Voortgangsbalk in scoreклeur
  - Toelichting (max 3 regels)
  - Tip in lichtgroene box onderaan

**Pagina 2 — Top 3 prioriteiten + Samenvatting**
- Zelfde header als pagina 1 maar smaller (logo + titel + datum)
- 3 prioriteitskaarten met gekleurde nummerbalk links
- Score-samenvatting balk: gemiddelde | criteria goed | aandachtspunten

### Bestandsnaam
`Vacature Analyse {functietitel} - {bedrijfsnaam}.pdf`

---

## Frontend interface

### Huisstijl
- Font: DM Sans (body) + DM Serif Display (koppen)
- Kleuren: zie huisstijl boven
- Header: gradient van #006f66 → #3d6b78 → #6895a2

### Chat-interface (stap 2)
- Agentberichten: lichtgrijze bubble links, avatar "AI" in groen
- Gebruikersberichten: groene bubble rechts
- Typing indicator met drie animerende bollen
- Enter = versturen, Shift+Enter = nieuwe regel

### Resultaten-weergave
- Per criterium: naam, score-badge (groen/oranje/rood), voortgangsbalk, 
  toelichting, verbeterpunt
- Prioriteits-criteria (perspectief + WIIFM) krijgen een ster ★ en 
  groene rand
- Onderaan: gemiddelde score, top 3 verbeterpunten
- Downloadknop voor PDF

---

## Projectstructuur

```
/
├── app/
│   ├── page.tsx                  # Hoofdpagina met chat-interface
│   ├── layout.tsx                # Root layout
│   └── api/
│       ├── extract/route.ts      # Context extraheren uit vacaturetekst
│       ├── analyse/route.ts      # Volledige analyse via Claude
│       └── pdf/route.ts          # PDF genereren en downloaden
├── components/
│   ├── ChatInterface.tsx         # Conversatie-component
│   ├── ResultsView.tsx           # Analyse-resultaten weergave
│   └── CriterionCard.tsx         # Individuele criterium-tegel
├── lib/
│   ├── claude.ts                 # Claude API wrapper
│   └── pdf-generator.tsx         # @react-pdf/renderer PDF-logica
├── public/
│   └── logo.png                  # Plug-in Recruitment logo
└── .env.local                    # ANTHROPIC_API_KEY (lokaal)
```

---

## Later toe te voegen: e-mail via O365

Voeg toe aan projectstructuur:
```
app/api/mail/route.ts             # Mail versturen via Microsoft Graph
```

Benodigde environment variables:
```
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_TENANT_ID=...
MAIL_FROM=jouw@emailadres.nl
```

Flow:
1. Na PDF-generatie: gebruiker vult e-mailadres in
2. `/api/mail` stuurt PDF als bijlage via Microsoft Graph API
3. Mail verstuurd vanuit jouw eigen O365-adres in huisstijl

Implementatie later toevoegen met:
```
npm install @microsoft/microsoft-graph-client @azure/identity
```

---

## Notities voor Claude Code

- Alle API-aanroepen naar Claude verlopen serverside (via API routes), 
  nooit vanuit de browser — zo blijft de API-sleutel veilig
- De PDF-generatie gebeurt ook serverside
- Gebruik TypeScript throughout
- Zorg voor goede error handling: als Claude geen geldige JSON teruggeeft, 
  vang dit op en toon een nette foutmelding
- De app is volledig Nederlandstalig
- Mobielvriendelijk (responsive design)
