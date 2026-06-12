import { NextRequest } from 'next/server'
import { db, toISOStr } from '@/lib/db'
import { Resend } from 'resend'
import { FROM_EMAIL, ADMIN_EMAIL } from '@/lib/resend'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const weekGeleden = new Date()
  weekGeleden.setDate(weekGeleden.getDate() - 7)
  const weekGeledenISO = weekGeleden.toISOString()

  const [users, nieuweGebruikers, ideeen] = await Promise.all([
    db`SELECT id, email, full_name, analyses_credits FROM users ORDER BY created_at DESC`,
    db`SELECT id, email, full_name, created_at FROM users WHERE created_at >= ${weekGeledenISO} ORDER BY created_at DESC`,
    db`
      SELECT i.inhoud, i.created_at, i.user_id, u.full_name, u.email as user_email
      FROM ideeen i
      LEFT JOIN users u ON u.id = i.user_id
      WHERE i.created_at >= ${weekGeledenISO}
      ORDER BY i.created_at DESC
    `,
  ])

  const totaalGebruikers = users.length
  const nieuweGebruikersCount = nieuweGebruikers.length

  const nieuweGebruikersRegels = nieuweGebruikers
    .map((u) => {
      const datum = new Date(toISOStr(u.created_at)).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'short',
      })
      return `<li><strong>${u.full_name ?? '—'}</strong> (${u.email}) op ${datum}</li>`
    })
    .join('')

  const ideeRegels = ideeen
    .map((i) => {
      const naam = i.full_name ?? '—'
      const emailAdres = i.user_email ?? '—'
      const datum = new Date(toISOStr(i.created_at)).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'short',
      })
      return `<li><strong>${naam}</strong> (${emailAdres}) op ${datum}:<br/><em>${i.inhoud}</em></li>`
    })
    .join('')

  const html = `
<h2>Wekelijks rapport Recrootools</h2>
<p><strong>Periode:</strong> afgelopen 7 dagen</p>

<h3>Nieuwe gebruikers (${nieuweGebruikersCount})</h3>
${nieuweGebruikersRegels ? `<ul>${nieuweGebruikersRegels}</ul>` : '<p>Geen nieuwe gebruikers deze week.</p>'}

<h3>Ideeënbus</h3>
${ideeRegels ? `<ul>${ideeRegels}</ul>` : '<p>Geen nieuwe ideeën deze week.</p>'}

<hr />
<p><strong>Totaal geregistreerde gebruikers:</strong> ${totaalGebruikers}</p>
`

  const { error: emailError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Recrootools weekrapport — ${nieuweGebruikersCount} nieuwe gebruiker${nieuweGebruikersCount !== 1 ? 's' : ''}`,
    html,
  })

  if (emailError) console.error('Resend fout weekrapport:', emailError)

  return Response.json({ ok: true, nieuweGebruikers: nieuweGebruikersCount, ideeen: ideeen.length, totaalGebruikers })
}
