# Landing Page + Dashboard/Admin Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full dark-theme redesign of recrootools — landing page with AI features + community section, dashboard and admin with sidebar navigation — using a shared component library.

**Architecture:** We build UI primitives first (tokens → components → layout), then rewrite the three pages using those components. No page is touched before its dependencies are in place. All components follow the existing code pattern: Tailwind CSS v4 for layout/spacing, inline styles for colors.

**Tech Stack:** Next.js 16.2.6, React 19, Tailwind CSS v4, TypeScript 5, Supabase SSR (`@supabase/ssr`), Geist font.

**Before every task:** Consult `node_modules/next/dist/docs/` if you are unsure about any Next.js API — this project runs Next.js 16, which has breaking changes from 14/15.

---

## File Map

**New files:**
- `components/ui/Button.tsx` — primary/ghost button, renders `<a>` or `<button>`
- `components/ui/Badge.tsx` — plan badge (dot + name) and tag pill (BETA, etc.)
- `components/ui/StatCard.tsx` — stat tile for admin overview
- `components/ui/ToolCard.tsx` — active tool card with hover
- `components/ui/ComingSoonCard.tsx` — muted dashed coming-soon card
- `components/layout/Sidebar.tsx` — icon-only sidebar, server component, includes logout form
- `components/layout/DarkLayout.tsx` — page wrapper with sidebar, server component
- `components/PublicIdeeBus.tsx` — public idea submission form, client component

**Modified files:**
- `app/globals.css` — replace vars with dark theme tokens
- `app/actions/ideeen.ts` — add `stuurPubliekIdee` server action
- `app/page.tsx` — full landing page rewrite
- `app/dashboard/page.tsx` — wrap in DarkLayout, dark-styled content
- `app/admin/page.tsx` — wrap in DarkLayout, add stats row

**Unchanged:**
- `components/IdeeBus.tsx` — authenticated variant, used on dashboard as-is
- All API routes, auth flow, vacature-analyse page

---

## Task 1: Design Tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css**

  Full replacement — remove `--background`, `--foreground`, and the dark-mode media query. Keep `@theme inline` for font tokens only. The app is always dark.

  ```css
  @import "tailwindcss";

  :root {
    --color-bg:          #0a1214;
    --color-surface:     #111c1e;
    --color-surface-alt: #0d1618;
    --color-border:      #1a2e30;
    --color-muted:       #4b6b6f;
    --color-accent:      #7db4c3;
    --color-primary:     #006f66;
    --color-text:        #ffffff;
    --color-text-muted:  #9ba3a9;
  }

  @theme inline {
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-geist-sans, Arial, sans-serif);
  }
  ```

- [ ] **Step 2: Type-check**

  Run from `recrootools/`:
  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/globals.css
  git commit -m "style: replace globals with dark theme design tokens"
  ```

---

## Task 2: Button + Badge Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Badge.tsx`

- [ ] **Step 1: Create `components/ui/Button.tsx`**

  ```tsx
  'use client'

  import { ReactNode } from 'react'

  type ButtonProps = {
    variant?: 'primary' | 'ghost'
    size?: 'sm' | 'md'
    children: ReactNode
    href?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    onClick?: () => void
    className?: string
  }

  export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    href,
    type = 'button',
    disabled,
    onClick,
    className = '',
  }: ButtonProps) {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40'
    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
    }
    const colors: Record<string, React.CSSProperties> = {
      primary: { backgroundColor: 'var(--color-primary)', color: '#ffffff' },
      ghost:   { backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' },
    }

    const cls = `${base} ${sizes[size]} ${className}`

    if (href) {
      return (
        <a href={href} className={cls} style={colors[variant]}>
          {children}
        </a>
      )
    }

    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cls}
        style={colors[variant]}
      >
        {children}
      </button>
    )
  }
  ```

- [ ] **Step 2: Create `components/ui/Badge.tsx`**

  ```tsx
  type BadgeProps =
    | { variant: 'plan'; plan: string; startedAt?: string }
    | { variant: 'tag'; label: string }

  export default function Badge(props: BadgeProps) {
    if (props.variant === 'tag') {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
        >
          {props.label}
        </span>
      )
    }

    return (
      <div
        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
            {props.plan} plan
          </p>
          {props.startedAt && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Gestart op {props.startedAt}
            </p>
          )}
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 3: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add components/ui/Button.tsx components/ui/Badge.tsx
  git commit -m "feat: add Button and Badge UI components"
  ```

---

## Task 3: StatCard, ToolCard, ComingSoonCard

**Files:**
- Create: `components/ui/StatCard.tsx`
- Create: `components/ui/ToolCard.tsx`
- Create: `components/ui/ComingSoonCard.tsx`

- [ ] **Step 1: Create `components/ui/StatCard.tsx`**

  ```tsx
  type StatCardProps = {
    value: string | number
    label: string
    positive?: boolean
  }

  export default function StatCard({ value, label, positive }: StatCardProps) {
    const valueColor =
      positive === true  ? '#4ade80' :
      positive === false ? '#f87171' :
      'var(--color-text)'

    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-2xl font-bold" style={{ color: valueColor }}>
          {value}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
      </div>
    )
  }
  ```

- [ ] **Step 2: Create `components/ui/ToolCard.tsx`**

  ```tsx
  type ToolCardProps = {
    href: string
    icon: string
    title: string
    description: string
    availability: string
  }

  export default function ToolCard({ href, icon, title, description, availability }: ToolCardProps) {
    return (
      <a
        href={href}
        className="group block rounded-2xl p-6 border border-[#1a2e30] hover:border-[#006f66] transition-colors"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-4"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {icon}
        </div>
        <h3
          className="font-semibold mb-1 transition-colors group-hover:text-[#006f66]"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {description}
        </p>
        <p className="text-xs mt-3 font-medium" style={{ color: 'var(--color-accent)' }}>
          {availability}
        </p>
      </a>
    )
  }
  ```

- [ ] **Step 3: Create `components/ui/ComingSoonCard.tsx`**

  ```tsx
  type ComingSoonCardProps = {
    title: string
    description: string
  }

  export default function ComingSoonCard({ title, description }: ComingSoonCardProps) {
    return (
      <div
        className="rounded-2xl p-6 border border-dashed opacity-60"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
          style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          ⧗
        </div>
        <h3 className="font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {description}
        </p>
        <p className="text-xs mt-3 font-medium uppercase tracking-wide" style={{ color: 'var(--color-border)' }}>
          Binnenkort
        </p>
      </div>
    )
  }
  ```

- [ ] **Step 4: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add components/ui/StatCard.tsx components/ui/ToolCard.tsx components/ui/ComingSoonCard.tsx
  git commit -m "feat: add StatCard, ToolCard, ComingSoonCard UI components"
  ```

---

## Task 4: Sidebar + DarkLayout

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/DarkLayout.tsx`

- [ ] **Step 1: Create `components/layout/Sidebar.tsx`**

  Server component — no `'use client'` directive. Uses server action in logout form.

  ```tsx
  import { logout } from '@/app/actions/auth'

  type ActiveItem = 'dashboard' | 'vacature-analyse' | 'ideeen' | 'admin'

  type SidebarProps = {
    activeItem: ActiveItem
    isAdmin: boolean
  }

  const NAV_ITEMS: Array<{ key: ActiveItem; href: string; icon: string; label: string }> = [
    { key: 'dashboard',         href: '/dashboard',         icon: '⊞', label: 'Dashboard' },
    { key: 'vacature-analyse',  href: '/vacature-analyse',  icon: '✦', label: 'Vacature Analyse' },
    { key: 'ideeen',            href: '/dashboard#ideeen',  icon: '💡', label: 'Ideeënbus' },
  ]

  export default function Sidebar({ activeItem, isAdmin }: SidebarProps) {
    return (
      <nav
        className="w-14 flex flex-col items-center gap-1 py-4 px-2 shrink-0"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          borderRight: '1px solid var(--color-border)',
          minHeight: '100vh',
        }}
      >
        {/* Logo mark */}
        <div
          className="w-7 h-7 rounded-full mb-4 shrink-0"
          style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
        />

        {/* Nav items */}
        {NAV_ITEMS.map(({ key, href, icon, label }) => (
          <a
            key={key}
            href={href}
            title={label}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors"
            style={{
              backgroundColor: activeItem === key ? 'var(--color-surface)' : 'transparent',
              color: activeItem === key ? 'var(--color-accent)' : 'var(--color-muted)',
            }}
          >
            {icon}
          </a>
        ))}

        {isAdmin && (
          <a
            href="/admin"
            title="Admin"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors"
            style={{
              backgroundColor: activeItem === 'admin' ? 'var(--color-surface)' : 'transparent',
              color: activeItem === 'admin' ? 'var(--color-accent)' : 'var(--color-muted)',
            }}
          >
            ⚙
          </a>
        )}

        {/* Logout */}
        <div className="mt-auto">
          <form action={logout}>
            <button
              type="submit"
              title="Uitloggen"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              →
            </button>
          </form>
        </div>
      </nav>
    )
  }
  ```

- [ ] **Step 2: Create `components/layout/DarkLayout.tsx`**

  ```tsx
  import { ReactNode } from 'react'
  import Sidebar from './Sidebar'

  type ActiveItem = 'dashboard' | 'vacature-analyse' | 'ideeen' | 'admin'

  type DarkLayoutProps = {
    activeItem: ActiveItem
    isAdmin: boolean
    children: ReactNode
  }

  export default function DarkLayout({ activeItem, isAdmin, children }: DarkLayoutProps) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Sidebar activeItem={activeItem} isAdmin={isAdmin} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    )
  }
  ```

- [ ] **Step 3: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add components/layout/Sidebar.tsx components/layout/DarkLayout.tsx
  git commit -m "feat: add Sidebar and DarkLayout layout components"
  ```

---

## Task 5: Public IdeeBus (Server Action + Component)

**Files:**
- Modify: `app/actions/ideeen.ts`
- Create: `components/PublicIdeeBus.tsx`

**Prerequisite check:** Before implementing, verify in Supabase that the `user_id` column in the `ideeen` table is nullable (allows `NULL`). If it is NOT nullable, you must first run this migration in Supabase SQL editor:
```sql
ALTER TABLE ideeen ALTER COLUMN user_id DROP NOT NULL;
```

- [ ] **Step 1: Add `stuurPubliekIdee` to `app/actions/ideeen.ts`**

  The file already has `'use server'` at the top (file-level directive — all exports are server actions). Do **not** add `'use server'` inside the function body.

  Add after the existing `stuurIdee` function, and add the `createAdminClient` import at the top. Keep `stuurIdee` unchanged.

  Full file after edit:
  ```ts
  'use server'

  import { createClient } from '@/lib/supabase/server'
  import { createAdminClient } from '@/lib/supabase/admin'

  export async function stuurIdee(formData: FormData): Promise<{ error?: string }> {
    const inhoud = (formData.get('inhoud') as string)?.trim()
    if (!inhoud) return { error: 'Leeg' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Niet ingelogd' }

    const { error } = await supabase
      .from('ideeen')
      .insert({ user_id: user.id, inhoud })

    if (error) return { error: error.message }
    return {}
  }

  export async function stuurPubliekIdee(formData: FormData): Promise<{ error?: string }> {
    const inhoud = (formData.get('inhoud') as string)?.trim()
    if (!inhoud) return { error: 'Leeg' }

    const admin = createAdminClient()
    const { error } = await admin
      .from('ideeen')
      .insert({ inhoud })

    if (error) return { error: error.message }
    return {}
  }
  ```

- [ ] **Step 2: Create `components/PublicIdeeBus.tsx`**

  ```tsx
  'use client'

  import { useState } from 'react'
  import { stuurPubliekIdee } from '@/app/actions/ideeen'

  type RecentIdee = {
    id: string
    inhoud: string
    daysAgo: string
  }

  type PublicIdeeBusProps = {
    recentIdeen: RecentIdee[]
  }

  type Status = 'idle' | 'laden' | 'succes' | 'fout'

  export default function PublicIdeeBus({ recentIdeen }: PublicIdeeBusProps) {
    const [inhoud, setInhoud] = useState('')
    const [status, setStatus] = useState<Status>('idle')

    async function handleVerstuur(e: React.FormEvent) {
      e.preventDefault()
      if (!inhoud.trim()) return
      setStatus('laden')
      const formData = new FormData()
      formData.set('inhoud', inhoud)
      const result = await stuurPubliekIdee(formData)
      if (result.error) {
        setStatus('fout')
      } else {
        setStatus('succes')
        setInhoud('')
      }
    }

    return (
      <div>
        {/* Form */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {status === 'succes' ? (
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ backgroundColor: '#0d1618', color: 'var(--color-accent)' }}
            >
              Bedankt! Je idee is ontvangen — we nemen het mee.
            </div>
          ) : (
            <form onSubmit={handleVerstuur}>
              <textarea
                value={inhoud}
                onChange={(e) => setInhoud(e.target.value)}
                placeholder="Beschrijf je idee zo concreet of vaag als je wilt…"
                className="w-full h-28 text-sm px-4 py-3 rounded-xl border outline-none resize-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              {status === 'fout' && (
                <p className="text-sm mt-2" style={{ color: '#f87171' }}>
                  Er ging iets mis. Probeer het opnieuw.
                </p>
              )}
              <button
                type="submit"
                disabled={!inhoud.trim() || status === 'laden'}
                className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {status === 'laden' ? 'Versturen…' : 'Idee insturen'}
              </button>
            </form>
          )}
        </div>

        {/* Recent ideas */}
        {recentIdeen.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Recente ideeën van recruiters
            </p>
            <div className="flex flex-col gap-3">
              {recentIdeen.map((idee) => (
                <div
                  key={idee.id}
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    "{idee.inhoud}"
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                    — recruiter · {idee.daysAgo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  ```

- [ ] **Step 3: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add app/actions/ideeen.ts components/PublicIdeeBus.tsx
  git commit -m "feat: add public idea submission action and PublicIdeeBus component"
  ```

---

## Task 6: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite `app/page.tsx`**

  ```tsx
  import { createAdminClient } from '@/lib/supabase/admin'
  import Button from '@/components/ui/Button'
  import Badge from '@/components/ui/Badge'
  import ToolCard from '@/components/ui/ToolCard'
  import ComingSoonCard from '@/components/ui/ComingSoonCard'
  import PublicIdeeBus from '@/components/PublicIdeeBus'

  const COMING_SOON = [
    {
      title: 'CV Screener',
      description: "Upload CV's, AI rankt kandidaten op fit met de vacature.",
    },
    {
      title: 'Outreach Schrijver',
      description: 'Gepersonaliseerde wervingsberichten op basis van kandidaatprofiel.',
    },
    {
      title: 'Interview Vragen Generator',
      description: 'Gerichte interviewvragen op basis van vacature + kandidaat.',
    },
    {
      title: 'Marktloon Checker',
      description: 'Is het salaris in jouw vacature competitief? AI vergelijkt met de markt.',
    },
  ]

  function daysAgoLabel(dateStr: string): string {
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 0) return 'vandaag'
    if (diff === 1) return '1 dag geleden'
    return `${diff} dagen geleden`
  }

  export default async function Home() {
    const admin = createAdminClient()
    const { data: ideeen } = await admin
      .from('ideeen')
      .select('id, inhoud, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    const recentIdeen = (ideeen ?? []).map((i) => ({
      id: i.id as string,
      inhoud: i.inhoud as string,
      daysAgo: daysAgoLabel(i.created_at as string),
    }))

    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Nav ── */}
        <header
          className="px-8 py-5 border-b sticky top-0 z-10"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
              />
              <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Recrootools
              </span>
              <Badge variant="tag" label="BETA" />
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-muted)' }}
              >
                Inloggen
              </a>
              <Button href="/signup" size="sm">Gratis starten</Button>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-8 py-24 text-center">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Badge variant="tag" label="AI-GEDREVEN" />
            <Badge variant="tag" label="COMMUNITY-BUILT" />
            <Badge variant="tag" label="GRATIS STARTEN" />
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6" style={{ color: 'var(--color-text)' }}>
            AI-tools gebouwd<br />
            <span style={{ color: 'var(--color-accent)' }}>door en voor recruiters</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Geen generieke software. Recrootools bouwt precies wat recruiters nodig hebben — samen met jou.
          </p>
          <div className="flex gap-4 justify-center">
            <Button href="/signup">Gratis starten</Button>
            <Button href="#tools" variant="ghost">Bekijk tools ↓</Button>
          </div>
        </section>

        {/* ── Beschikbaar nu ── */}
        <section id="tools" className="max-w-5xl mx-auto px-8 pb-20">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'var(--color-muted)' }}
          >
            Beschikbaar nu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ToolCard
              href="/vacature-analyse"
              icon="✦"
              title="Vacature Analyse"
              description="Analyseer vacatureteksten op 6 criteria: leesbaarheid, inclusiviteit, aantrekkelijkheid, duidelijkheid, marktaansluiting en structuur. Inclusief PDF-rapport."
              availability="Gratis beschikbaar"
            />
          </div>
        </section>

        {/* ── In ontwikkeling ── */}
        <section className="max-w-5xl mx-auto px-8 pb-20">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'var(--color-muted)' }}
          >
            In ontwikkeling
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMING_SOON.map((item) => (
              <ComingSoonCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </section>

        {/* ── Community / Ideeënbus ── */}
        <section
          className="border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="max-w-5xl mx-auto px-8 py-20">
            <div className="max-w-xl">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--color-muted)' }}
              >
                Community
              </p>
              <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                Jij bepaalt wat we bouwen
              </h2>
              <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Recrootools is community-driven. Stuur een idee in — de meest gevraagde tools bouwen we als volgende.
              </p>
              <PublicIdeeBus recentIdeen={recentIdeen} />
            </div>
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <section
          className="border-t text-center py-20"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Klaar om te starten?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
            Gratis account, geen creditcard nodig.
          </p>
          <Button href="/signup">Gratis starten</Button>
        </section>

      </main>
    )
  }
  ```

- [ ] **Step 2: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Start dev server and verify landing page**

  Run: `npm run dev` — open http://localhost:3000

  Check:
  - Dark background throughout
  - Nav: logo, BETA badge, Inloggen link, Gratis starten button
  - Hero: large heading, accent-colored second line, two CTAs
  - "Beschikbaar nu": Vacature Analyse card
  - "In ontwikkeling": 4 coming-soon cards (faded, dashed border)
  - Community section: idea form + recent ideas (or empty state if no ideas yet)
  - Footer CTA

- [ ] **Step 4: Commit**

  ```bash
  git add app/page.tsx
  git commit -m "feat: full landing page redesign with dark theme and community section"
  ```

---

## Task 7: Dashboard Page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Rewrite `app/dashboard/page.tsx`**

  ```tsx
  import { createClient } from '@/lib/supabase/server'
  import { redirect } from 'next/navigation'
  import DarkLayout from '@/components/layout/DarkLayout'
  import Badge from '@/components/ui/Badge'
  import ToolCard from '@/components/ui/ToolCard'
  import ComingSoonCard from '@/components/ui/ComingSoonCard'
  import IdeeBus from '@/components/IdeeBus'

  const ADMIN_EMAIL = 'boudewijn@plgn.nl'

  const COMING_SOON = [
    { title: 'CV Screener',               description: "Upload CV's, AI rankt kandidaten op fit." },
    { title: 'Outreach Schrijver',         description: 'Gepersonaliseerde wervingsberichten.' },
    { title: 'Interview Vragen Generator', description: 'Vragen op basis van vacature + kandidaat.' },
    { title: 'Marktloon Checker',          description: 'Is jouw salaris competitief?' },
  ]

  export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, plan, plan_started_at')
      .eq('id', user.id)
      .single()

    const planStarted = profile?.plan_started_at
      ? new Date(profile.plan_started_at).toLocaleDateString('nl-NL', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
      : undefined

    const isAdmin = user.email === ADMIN_EMAIL

    return (
      <DarkLayout activeItem="dashboard" isAdmin={isAdmin}>
        <div className="px-8 py-10 max-w-4xl">

          {/* Header */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'var(--color-muted)' }}
          >
            Dashboard
          </p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            Welkom{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
            {user.email}
          </p>

          {/* Plan badge */}
          <div className="mb-12">
            <Badge
              variant="plan"
              plan={profile?.plan ?? 'free'}
              startedAt={planStarted}
            />
          </div>

          {/* Tools */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: 'var(--color-muted)' }}
          >
            Tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            <ToolCard
              href="/vacature-analyse"
              icon="✦"
              title="Vacature Analyse"
              description="Analyseer vacatureteksten op 6 criteria en ontvang een PDF-rapport."
              availability="Gratis beschikbaar"
            />
            {COMING_SOON.map((item) => (
              <ComingSoonCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>

          {/* Ideeënbus */}
          <div id="ideeen" className="max-w-xl">
            <IdeeBus />
          </div>

        </div>
      </DarkLayout>
    )
  }
  ```

- [ ] **Step 2: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Verify in browser (must be logged in)**

  Open http://localhost:3000/dashboard

  Check:
  - Dark background, sidebar visible on left
  - Sidebar: logo mark, 3 nav icons (dashboard highlighted), logout button
  - Welcome heading + email
  - Plan badge with green dot
  - Vacature Analyse ToolCard + 4 ComingSoonCards
  - IdeeBus form at bottom

- [ ] **Step 4: Commit**

  ```bash
  git add app/dashboard/page.tsx
  git commit -m "feat: dashboard redesign with DarkLayout and sidebar"
  ```

---

## Task 8: Admin Page

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Rewrite `app/admin/page.tsx`**

  ```tsx
  import { createClient } from '@/lib/supabase/server'
  import { createAdminClient } from '@/lib/supabase/admin'
  import { redirect } from 'next/navigation'
  import DarkLayout from '@/components/layout/DarkLayout'
  import StatCard from '@/components/ui/StatCard'

  const ADMIN_EMAIL = 'boudewijn@plgn.nl'

  export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

    const admin = createAdminClient()

    const [{ data: authData }, { data: profiles }, { data: ideeen, error: ideeenError }] =
      await Promise.all([
        admin.auth.admin.listUsers({ perPage: 200 }),
        admin.from('profiles').select('*'),
        admin.from('ideeen').select('*'),
      ])

    const authUsers = authData?.users ?? []

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
    const emailMap   = Object.fromEntries(authUsers.map((u) => [u.id, u.email ?? '']))

    const gebruikers = authUsers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((u) => ({
        id: u.id,
        email: u.email ?? '',
        naam:
          profileMap[u.id]?.full_name ??
          (u.user_metadata as Record<string, string>)?.full_name ??
          '—',
        plan: profileMap[u.id]?.plan ?? 'free',
        lidSinds: new Date(u.created_at).toLocaleDateString('nl-NL', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
      }))

    const ideeenLijst = (ideeen ?? [])
      .sort((a, b) => {
        const da = a.created_at ?? a.aangemaakt_op ?? ''
        const db = b.created_at ?? b.aangemaakt_op ?? ''
        return db.localeCompare(da)
      })
      .map((i) => {
        const ts = i.created_at ?? i.aangemaakt_op
        const authUser = authUsers.find((u) => u.id === i.user_id)
        return {
          id: i.id,
          inhoud: i.inhoud,
          datum: ts
            ? new Date(ts).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
          naam:
            profileMap[i.user_id]?.full_name ??
            (authUser?.user_metadata as Record<string, string>)?.full_name ??
            'anoniem',
          email: emailMap[i.user_id] ?? '—',
        }
      })

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const newThisWeek = authUsers.filter(
      (u) => new Date(u.created_at) > oneWeekAgo
    ).length

    return (
      <DarkLayout activeItem="admin" isAdmin={true}>
        <div className="px-8 py-10 max-w-4xl space-y-16">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              Admin
            </p>
            <span
              className="text-xs px-2.5 py-1 rounded-md font-semibold"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
            >
              {gebruikers.length} / 100 gebruikers
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard value={gebruikers.length} label="gebruikers" />
            <StatCard value={ideeenLijst.length} label="ideeën" />
            <StatCard value={`+${newThisWeek}`} label="nieuwe deze week" positive={newThisWeek > 0} />
          </div>

          {/* Gebruikers tabel */}
          <div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Gebruikers
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              Alle geregistreerde accounts
            </p>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div
                className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  color: 'var(--color-muted)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <span>Naam</span>
                <span>E-mail</span>
                <span>Plan</span>
                <span>Lid sinds</span>
              </div>

              {gebruikers.length === 0 && (
                <div className="px-5 py-8 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                  Geen gebruikers gevonden
                </div>
              )}

              {gebruikers.map((g, i) => (
                <div
                  key={g.id}
                  className="grid items-center px-5 py-3.5 text-sm"
                  style={{
                    gridTemplateColumns: '2fr 2fr 1fr 1fr',
                    borderTop: i === 0 ? 'none' : `1px solid var(--color-border)`,
                    backgroundColor: 'var(--color-surface-alt)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>{g.naam}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{g.email}</span>
                  <span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium capitalize"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}
                    >
                      {g.plan}
                    </span>
                  </span>
                  <span style={{ color: 'var(--color-muted)' }}>{g.lidSinds}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideeënbus */}
          <div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Ideeënbus
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              {ideeenError
                ? 'Query mislukt — zie fout hieronder'
                : `${ideeenLijst.length} ${ideeenLijst.length === 1 ? 'idee' : 'ideeën'} ingediend`}
            </p>

            {ideeenError && (
              <div
                className="mb-4 rounded-xl px-4 py-3 text-sm font-mono"
                style={{ backgroundColor: '#1a0a0a', color: '#f87171' }}
              >
                Query fout: {ideeenError.message}
              </div>
            )}

            {ideeenLijst.length === 0 ? (
              <div
                className="rounded-2xl px-5 py-12 text-sm text-center"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
              >
                Nog geen ideeën ingediend
              </div>
            ) : (
              <div className="space-y-3">
                {ideeenLijst.map((i) => (
                  <div
                    key={i.id}
                    className="rounded-2xl p-5"
                    style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                  >
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text)' }}>
                      {i.inhoud}
                    </p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                      <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{i.naam}</span>
                      <span>·</span>
                      <span>{i.email}</span>
                      <span>·</span>
                      <span>{i.datum}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </DarkLayout>
    )
  }
  ```

- [ ] **Step 2: Type-check**

  ```
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Verify in browser (must be logged in as boudewijn@plgn.nl)**

  Open http://localhost:3000/admin

  Check:
  - Sidebar with admin icon highlighted
  - Stats row: 3 stat cards (gebruikers, ideeën, nieuwe deze week)
  - Users table with dark styling
  - Ideeënbus list

- [ ] **Step 4: Final build check**

  ```
  npm run build
  ```
  Expected: build completes with no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add app/admin/page.tsx
  git commit -m "feat: admin redesign with DarkLayout, sidebar, and stats overview"
  ```

---

## Done

All pages now use the shared component library and dark theme. Landing page has a public community section. Dashboard and admin use the same sidebar layout. Verify the full flow end-to-end:
1. `/` — landing page, dark, with community section
2. `/login` or `/signup` — unchanged (will look inconsistent until styled separately — out of scope)
3. `/dashboard` — sidebar, tools grid
4. `/admin` — sidebar, stats, users table, ideas
