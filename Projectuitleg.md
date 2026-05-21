# Recrootools — Projectdocumentatie

Recrootools is een SaaS-platform met AI-tools specifiek voor recruiters, ontwikkeld door Plug-in Recruitment. Het platform biedt tools die het dagelijkse werk van recruiters sneller, beter en commercieel waardevoller maken.

---

## Gebruikersbeheer

### Registratie en inloggen

Gebruikers registreren zich met naam, e-mailadres en wachtwoord. Na registratie ontvangen zij een bevestigingsmail. Pas na het klikken op de bevestigingslink is het account actief en kunnen zij inloggen.

### Bètalimiet

Tijdens de bètafase is het aantal accounts beperkt tot **100 gebruikers**. Probeert gebruiker 101 zich te registreren, dan ontvangt hij een melding dat aanmelden tijdelijk gesloten is. De limiet is eenvoudig aan te passen zodra de bèta afgerond is.

### Profielen

Elke gebruiker heeft een profiel met:
- Naam
- E-mailadres
- Actief abonnement (plan)
- Startdatum van het abonnement

---

## Betaalplannen

Het platform werkt met een plannenstructuur. Elk account heeft een **plan** dat bepaalt welke tools toegankelijk zijn. Momenteel zijn de volgende plannen voorzien:

| Plan | Beschrijving |
|---|---|
| **Free** | Toegang tot gratis tools |
| **Pro** *(gepland)* | Toegang tot alle tools, hogere gebruikslimieten |
| **Team** *(gepland)* | Meerdere gebruikers onder één account |

> Betalingsintegratie is nog niet geïmplementeerd. Planupgrades worden voorlopig handmatig ingesteld via de admin-pagina.

---

## Mini-app: Vacature Analyse

De Vacature Analyse is de eerste en huidige kernfunctionaliteit van Recrootools. De tool analyseert een vacaturetekst op **13 criteria** en genereert een gedetailleerd rapport met scores, toelichtingen, verbeterpunten en een downloadbare PDF.

### Hoe werkt het?

1. **Invoer** — De gebruiker geeft een URL op (de tool haalt de vacaturetekst automatisch op) of plakt de vacaturetekst handmatig.
2. **Context bevestigen** — De tool extraheert automatisch functietitel, bedrijfsnaam, sector, senioriteit, salaris en contractvorm. De gebruiker bevestigt of corrigeert deze gegevens via een chatinterface.
3. **Analyse** — De vacaturetekst wordt beoordeeld op 13 criteria via AI.
4. **Resultaat** — De gebruiker ziet een overzicht met scores per criterium, een samenvatting en de top 3 verbeterpunten. Het rapport is te downloaden als PDF.

### Beoordelingscriteria

De analyse is opgebouwd uit twee groepen:

#### Basisanalyse (6 standaard criteria)

| Criterium | Wat wordt beoordeeld? |
|---|---|
| **Perspectief** | Schrijft de tekst vanuit de kandidaat (jij-vorm) of vanuit het bedrijf? |
| **WIIFM** | Welke concrete voordelen krijgt de kandidaat? (salaris, doorgroei, cultuur) |
| **Inclusief** | Genderneutraal taalgebruik, geen onnodige drempelbarrières in de eisen |
| **B2-niveau** | Begrijpelijkheid passend bij het senioriteitsniveau en de sector |
| **Call to action** | Duidelijke, laagdrempelige sollicitatie-oproep met contactmogelijkheid |
| **Compleetheid** | Alle relevante informatie aanwezig en logisch geordend |

#### Uitgebreide analyse (7 extra criteria)

| Criterium | Wat wordt beoordeeld? |
|---|---|
| **Rol-toon match** | Past de schrijftoon bij het senioriteitsniveau? |
| **Vindbaarheid (SEO)** | Locatie vermeld, salarisrange aanwezig, relevante zoektermen gebruikt? |
| **Knock-outeisen** | Zijn er onnodige drempelbarrières die goede kandidaten weghouden? |
| **Onderscheidend vermogen** | Wat maakt deze vacature anders dan 100 vergelijkbare vacatures? |
| **Employer branding** | Is er een concreet en geloofwaardig bedrijfsverhaal met bewijs? |
| **Praktische info** | Contractvorm, startdatum en hybride werken duidelijk vermeld? |
| **Tone-of-voice** | Past de schrijftoon bij de branche? |

### Strengere beoordeling

De tool hanteert vaste scoregrenzen die nooit overschreden mogen worden:

- **Perspectief** — openingszin vanuit het bedrijf ("wij zoeken") → maximaal 5/10
- **WIIFM** — geen concreet salaris vermeld → maximaal 5/10
- **Call to action** — geen contactpersoon vermeld → maximaal 4/10
- **Rol-toon match** — juniortoon bij senior- of directeursrol → maximaal 4/10
- **Onderscheidend vermogen** — generieke termen zonder bewijs → maximaal 4/10

Een gemiddelde vacature scoort 4–6 op de meeste criteria. Dit geeft bedrijven een concreet aanknopingspunt om hulp in te schakelen bij het verbeteren van hun vacatures.

### Scoreschaal

| Score | Oordeel |
|---|---|
| 7–10 | Goed |
| 5–6 | Matig |
| 1–4 | Zwak |

De gemiddelde score wordt berekend over alle 13 criteria.

### PDF-rapport

Het downloadbare rapport bestaat uit 3 pagina's:

- **Pagina 1** — Diagonale header met totaalscore, samenvatting ("Kort & goed") en de 6 standaard criteria
- **Pagina 2** — De 7 extra criteria
- **Pagina 3** — Top 3 prioriteiten met probleembeschrijving en advies, plus de totaalscore balk

---

## Ideeënbus

Op het dashboard kunnen gebruikers ideeën indienen voor nieuwe tools of verbeteringen. Er is geen minimale of maximale lengte — elk idee is welkom.

Ingediende ideeën zijn zichtbaar voor de beheerder via de admin-pagina. De ideeënbus dient als directe feedbacklijn tussen gebruikers en de ontwikkeling van het platform.

---

## Admin-pagina

Toegankelijk voor de beheerder via `/admin`. Toont:

- **Gebruikersoverzicht** — naam, e-mailadres, actief plan en registratiedatum van alle accounts
- **Ideeënbus** — alle ingediende ideeën met naam, e-mailadres en datum van de indiener
- **Bètateller** — huidig aantal gebruikers ten opzichte van het maximum (100)
