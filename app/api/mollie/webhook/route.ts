import { createMollieClient } from '@mollie/api-client'
import { db } from '@/lib/db'

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! })

export async function POST(request: Request) {
  const body = await request.text()
  const params = new URLSearchParams(body)
  const id = params.get('id')

  if (!id) return new Response('Missing id', { status: 400 })

  const payment = await mollie.payments.get(id)
  const userId = (payment.metadata as { userId?: string })?.userId

  if (payment.status === 'paid' && userId) {
    await db`
      UPDATE betalingen
      SET status = 'paid', paid_at = NOW()
      WHERE id = ${id} AND status = 'pending'
    `
    await db`
      UPDATE users
      SET analyses_credits = analyses_credits + 10
      WHERE id = ${userId}
    `
  } else if (
    (payment.status === 'failed' ||
     payment.status === 'expired' ||
     payment.status === 'canceled') &&
    userId
  ) {
    await db`UPDATE betalingen SET status = ${payment.status} WHERE id = ${id}`
  }

  return new Response('OK', { status: 200 })
}
