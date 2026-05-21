import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL, ADMIN_EMAIL } from '@/lib/resend'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const admin = createAdminClient()

  const weekGeleden = new Date()
  weekGeleden.setDate(weekGeleden.getDate() - 7)
  const weekGeledenISO = weekGeleden.toISOString()

  const [{ data: analyses }, { data: authData }] = await Promise.all([
    admin
      .from('analyses')
      .select('user_id, created_at')
      .gte('created_at', weekGeledenISO),
    admin.auth.admin.listUsers({ perPage: 200 }),
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

  const regels = Object.entries(telPerGebruiker)
    .sort(([, a], [, b]) => b - a)
    .map(([uid, tel]) => `<li>${gebruikerNamen[uid] ?? uid}: ${tel}x</li>`)
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
${regels ? `<h3>Per gebruiker</h3><ul>${regels}</ul>` : '<p>Geen analyses uitgevoerd deze week.</p>'}
<hr />
<p><strong>Totaal geregistreerde gebruikers:</strong> ${totaalGebruikers}</p>
`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Recrootools weekrapport — ${totaal} analyse${totaal !== 1 ? 's' : ''}`,
    html,
  })

  return Response.json({ ok: true, totaal, uniekeGebruikers })
}
