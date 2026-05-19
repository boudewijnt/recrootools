import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen bg-white">
      <header className="px-8 py-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
            />
            <span className="text-lg font-semibold text-black tracking-tight">
              Recrootools
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm hover:underline"
              style={{ color: '#9ba3a9' }}
            >
              Uitloggen
            </button>
          </form>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-semibold text-black mb-2">
          Welkom{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-sm mb-12" style={{ color: '#9ba3a9' }}>
          {user.email}
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div>
            <p className="text-sm font-medium text-black capitalize">
              {profile?.plan ?? 'free'} plan
            </p>
            {planStarted && (
              <p className="text-xs mt-0.5" style={{ color: '#9ba3a9' }}>
                Gestart op {planStarted}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
