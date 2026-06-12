import { auth } from '@clerk/nextjs/server'
import { createMollieClient } from '@mollie/api-client'
import { db } from '@/lib/db'

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! })

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const payment = await mollie.payments.create({
    amount: { currency: 'EUR', value: '20.00' },
    description: '10 analyses — Recrootools',
    redirectUrl: `${siteUrl}/betaling/geslaagd`,
    webhookUrl: `${siteUrl}/api/mollie/webhook`,
    metadata: { userId },
  })

  await db`
    INSERT INTO betalingen (id, user_id, credits, bedrag, status)
    VALUES (${payment.id}, ${userId}, 10, 20.00, 'pending')
  `

  return Response.json({ checkoutUrl: payment.getCheckoutUrl() })
}
