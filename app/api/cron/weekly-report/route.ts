import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { FROM_EMAIL, ADMIN_EMAIL } from '@/lib/resend'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const admin = createAdminClient()

  const weekGeleden = new Date()
  weekGeleden.setDate(weekGeleden.getDate() - 7)
  const weekGeledenISO = weekGeleden.toISOString()

  const [{ data: analyses }, { data: authData }, { data: ideeen }] = await Promise.all([
    admin.from('analyses').select('user_id, created_at').gte('created_at', weekGeledenISO),
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('ideeen').select('user_id, inhoud, created_at').gte('created_at', weekGeledenISO),
  ])

  const totaal = analyses?.length ?? 0
  const uniekeGebruikers = new Set(analyses?.map((a) => a.user_id)).size

  const telPerGebruiker = (analyses ?? []).reduce<Record<string, number>>((acc, a) => {
    if (a.user_id) acc[a.user_id] = (acc[a.user_id] ?? 0) + 1
    return acc
  }, {})

  const gebruikerNamen = Object.fromEntries(
    (authData?.users ?? []).map((u) => [
      u.id,
      (u.user_metadata as Record<string, string>)?.full_name ?? u.email ?? u.id,
    ])
  )
  const gebruikerEmails = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
  )

  const analyseRegels = Object.entries(telPerGebruiker)
    .sort(([, a], [, b]) => b - a)
    .map(([uid, tel]) => `<li>${gebruikerNamen[uid] ?? uid}: ${tel}x</li>`)
    .join('')

  const ideeRegels = (ideeen ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((i) => {
      const naam = gebruikerNamen[i.user_id] ?? '—'
      const emailAdres = gebruikerEmails[i.user_id] ?? '—'
      const datum = new Date(i.created_at).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'short',
      })
      return `<li><strong>${naam}</strong> (${emailAdres}) op ${datum}:<br/><em>${i.inhoud}</em></li>`
    })
    .join('')

  const totaalGebruikers = authData?.users?.length ?? 0

  const html = `
<h2>Wekelijks rapport Recrootools</h2>
<p><strong>Periode:</strong> afgelopen 7 dagen</p>

<h3>Vacature analyses</h3>
<ul>
  <li><strong>Totaal analyses:</strong> ${totaal}</li>
  <li><strong>Unieke gebruikers:</strong> ${uniekeGebruikers}</li>
</ul>
${analyseRegels ? `<h4>Per gebruiker</h4><ul>${analyseRegels}</ul>` : '<p>Geen analyses uitgevoerd deze week.</p>'}

<h3>Ideeënbus</h3>
${ideeRegels ? `<ul>${ideeRegels}</ul>` : '<p>Geen nieuwe ideeën deze week.</p>'}

<hr />
<p><strong>Totaal geregistreerde gebruikers:</strong> ${totaalGebruikers}</p>
`

  const { error: emailError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Recrootools weekrapport — ${totaal} analyse${totaal !== 1 ? 's' : ''}`,
    html,
  })

  if (emailError) console.error('Resend fout weekrapport:', emailError)

  return Response.json({ ok: true, totaal, uniekeGebruikers, ideeen: ideeen?.length ?? 0 })
}
