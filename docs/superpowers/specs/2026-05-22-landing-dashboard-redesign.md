# Recrootools — Landing Page + Dashboard/Admin Redesign

**Date:** 2026-05-22  
**Status:** Approved

---

## Context

Next.js 15 app (see AGENTS.md — consult `node_modules/next/dist/docs/` before writing code). Uses Tailwind CSS v4 (`@import "tailwindcss"` syntax), Supabase for auth + database, Geist font.

Existing color palette: `#006f66` (primary teal), `#7db4c3` / `#6895a2` (light teal), `#9ba3a9` (muted text).  
Existing tools: Vacature Analyse (vacancy analysis on 6 criteria, outputs PDF).  
Existing components: `IdeeBus`, `ChatInterface`, `CriterionCard`, `ResultsView`.

---

## Goals

1. Landing page (`/`) — beautiful dark marketing page with current + upcoming features and a community concept.
2. Dashboard (`/dashboard`) — dark theme with sidebar navigation.
3. Admin (`/admin`) — same sidebar layout plus a stats overview row.
4. Component library — shared reusable building blocks used across all pages.

---

## Design Direction

- **Style:** Dark & ambitieus. Background `#0a1214`, cards `#111c1e`, borders `#1a2e30`, primary `#006f66`, accent `#7db4c3`, muted `#4b6b6f`. White for primary text.
- **Community:** Ideeënbus publiek — visitors can submit ideas *before* signing up. Show 3–5 most recent ideas (anonymized as "recruiter · X dagen geleden"). Testimonials/stats added later when real users exist.
- **Architecture:** Full component library (approach C) — shared tokens, layout wrapper, and UI components. No per-page duplication.

---

## 1. Design Tokens

Replace the existing `--background` / `--foreground` variables and the `@media (prefers-color-scheme: dark)` block in `app/globals.css` with these tokens (the dark theme is always on — no light/dark toggle):

```css
--color-bg:          #0a1214;
--color-surface:     #111c1e;
--color-surface-alt: #0d1618;
--color-border:      #1a2e30;
--color-muted:       #4b6b6f;
--color-accent:      #7db4c3;
--color-primary:     #006f66;
--color-text:        #ffffff;
--color-text-muted:  #9ba3a9;
```

Keep `--font-sans` / `--font-mono` and the `@theme inline` block unchanged.

---

## 2. Component Library

### `components/ui/Button.tsx`
Variants: `primary` (bg `--color-primary`, white text), `ghost` (bg `--color-surface`, accent text).  
Sizes: `sm`, `md`.

### `components/ui/Badge.tsx`
Small pill label. Variants: `plan` (green dot + plan name), `tag` (teal bg, accent text, e.g. "BETA", "GRATIS").

### `components/ui/StatCard.tsx`
Dark card with a large number, small label, optional trend color (green for positive). Used in admin.

### `components/ui/ToolCard.tsx`
Active tool card: teal icon square, title, description, availability label, hover border highlight.

### `components/ui/ComingSoonCard.tsx`
Muted dashed-border card: coming-soon icon, title, description. Visually dimmed.

### `components/layout/Sidebar.tsx`
Client component. Fixed left column (`w-14`). Contains: logo mark, icon nav items, logout at bottom.  
Nav items (icon-only, with `title` tooltip on hover): Dashboard (⊞), Vacature Analyse (✦), Ideeënbus (💡), Admin (⚙ — only rendered when `user.email === 'boudewijn@plgn.nl'`), Uitloggen (→).  
Active item: `--color-surface` background + `--color-accent` icon.  
Accepts `activeItem` prop (string key) and `isAdmin` boolean prop.

### `components/layout/DarkLayout.tsx`
Server component wrapper. Renders `<Sidebar>` + `<main>` side by side on a `--color-bg` background. Receives `activeItem` and `children`.

---

## 3. Landing Page (`app/page.tsx`)

Standalone page — no sidebar. Sections top to bottom:

### Nav
- Logo mark + "Recrootools" wordmark + "BETA" tag badge.
- Right: "Inloggen" ghost link, "Gratis starten" primary button.

### Hero
- Three pill badges: "AI-GEDREVEN", "COMMUNITY-BUILT", "GRATIS STARTEN".
- H1: "AI-tools gebouwd **door en voor recruiters**" (accent color on second line).
- Subtitle: "Geen generieke software. Recrootools bouwt precies wat recruiters nodig hebben — samen met jou."
- Two CTAs: "Gratis starten" (primary) + "Bekijk tools ↓" (ghost).

### Beschikbaar nu
- Section label "BESCHIKBAAR NU".
- One `ToolCard` for Vacature Analyse with expanded description (6 criteria, PDF-rapport).

### In ontwikkeling
- Section label "IN ONTWIKKELING".
- Grid of four `ComingSoonCard` items:
  1. **CV Screener** — Upload CV's, AI rankt kandidaten op fit met de vacature.
  2. **Outreach Schrijver** — Gepersonaliseerde wervingsberichten op basis van kandidaatprofiel.
  3. **Interview Vragen Generator** — Gerichte interviewvragen op basis van vacature + kandidaat.
  4. **Marktloon Checker** — Is het salaris in jouw vacature competitief? AI vergelijkt met de markt.

### Community / Ideeënbus
- Section label "COMMUNITY".
- H2: "Jij bepaalt wat we bouwen".
- Subtitle: "Recrootools is community-driven. Stuur een idee in — de meest gevraagde tools bouwen we als volgende."
- `PublicIdeeBus` component (see below).
- Below the form: "RECENTE IDEEËN VAN RECRUITERS" — 3 most recent ideas from `ideeen` table, anonymized.

### Footer CTA
- "Klaar om te starten?" + subtitle + "Gratis starten" primary button.

---

## 4. Public IdeeBus

### `components/PublicIdeeBus.tsx`
Client component, same form UI as `IdeeBus` but calls a new server action `stuurPubliekIdee`.

### `app/actions/ideeen.ts` — add `stuurPubliekIdee`
New server action that inserts into `ideeen` with `user_id: null`. Requires a new Supabase RLS policy allowing anonymous inserts (or service role insert via admin client).

The recent ideas shown on the landing page are fetched server-side in `app/page.tsx` using the Supabase server client — query `ideeen` ordered by `created_at` desc, limit 5, select `inhoud` + `created_at` only (no PII).

---

## 5. Dashboard (`app/dashboard/page.tsx`)

Wrap existing content in `<DarkLayout activeItem="dashboard">`.

Content:
- Page label "DASHBOARD" (muted, small caps).
- Welcome heading + email.
- `<Badge variant="plan">` for current plan.
- Section label "TOOLS" + grid of `ToolCard` (Vacature Analyse) + `ComingSoonCard` items (CV Screener, etc.).
- `<IdeeBus>` at the bottom (existing authenticated component, unchanged).

---

## 6. Admin (`app/admin/page.tsx`)

Wrap in `<DarkLayout activeItem="admin">`.

Content:
- Page label "ADMIN" + gebruikers count badge (e.g. "8 / 100").
- Stats row: three `StatCard` components — gebruikers, ideeën, nieuwe deze week.
- Gebruikers table — dark styled, same columns as now (naam, e-mail, plan, lid sinds).
- Ideeënbus lijst — dark styled cards, same data as now.

---

## 7. File Changes Summary

**New files:**
- `components/ui/Button.tsx`
- `components/ui/Badge.tsx`
- `components/ui/StatCard.tsx`
- `components/ui/ToolCard.tsx`
- `components/ui/ComingSoonCard.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/DarkLayout.tsx`
- `components/PublicIdeeBus.tsx`

**Modified files:**
- `app/globals.css` — design tokens
- `app/page.tsx` — full landing page
- `app/dashboard/page.tsx` — DarkLayout + dark styled content
- `app/admin/page.tsx` — DarkLayout + stats row + dark styled content
- `app/actions/ideeen.ts` — add `stuurPubliekIdee`

**Unchanged:**
- `components/IdeeBus.tsx` — authenticated variant, used on dashboard as-is
- All API routes, auth flow, vacature-analyse page

---

## Constraints

- **Public IdeeBus RLS:** `stuurPubliekIdee` uses the admin client (`createAdminClient`) to bypass RLS — same pattern already used in `app/admin/page.tsx`. This avoids needing a schema migration. The `user_id` column must be nullable in the `ideeen` table; if it isn't, the server action returns a graceful error and we add a migration note.
- **Recent ideas query:** Fetched server-side with `createClient()` (anon key). Requires a Supabase RLS read policy on `ideeen` that allows public `SELECT` of `inhoud` + `created_at` only. If that policy doesn't exist, fall back to the admin client for this read too.
- **AGENTS.md:** Before writing any Next.js code, check `node_modules/next/dist/docs/` for current API conventions — this project uses a version with breaking changes.
