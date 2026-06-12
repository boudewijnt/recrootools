import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { FROM_EMAIL, ADMIN_EMAIL } from '@/lib/resend'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return new Response('No webhook secret', { status: 500 })

  const headerPayload = await headers()
  const svixId        = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent
  try {
    evt = new Webhook(WEBHOOK_SECRET).verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email    = email_addresses[0]?.email_address ?? ''
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null

    await db`
      INSERT INTO users (id, email, full_name, analyses_credits)
      VALUES (${id}, ${email}, ${fullName}, 5)
      ON CONFLICT (id) DO NOTHING
    `

    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nieuwe aanmelding: ${fullName ?? email}`,
        html: `<p>Nieuwe gebruiker op Recrootools:</p>
<ul>
  <li><strong>Naam:</strong> ${fullName ?? '—'}</li>
  <li><strong>E-mail:</strong> ${email}</li>
</ul>`,
      })
    } catch {
      // e-mail failure mag niet blokkeren
    }
  }

  return new Response('OK', { status: 200 })
}
