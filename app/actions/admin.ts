'use server'

import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function setCredits(userId: string, credits: number): Promise<{ error?: string }> {
  await requireAdmin()
  if (credits < 0) return { error: 'Credits kunnen niet negatief zijn' }
  await db`UPDATE users SET analyses_credits = ${credits} WHERE id = ${userId}`
  return {}
}

export async function deleteIdee(id: string): Promise<{ error?: string }> {
  await requireAdmin()
  await db`DELETE FROM ideeen WHERE id = ${id}`
  return {}
}
