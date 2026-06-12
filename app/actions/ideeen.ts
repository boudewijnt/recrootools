'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function stuurIdee(formData: FormData): Promise<{ error?: string }> {
  const inhoud = (formData.get('inhoud') as string)?.trim()
  if (!inhoud) return { error: 'Leeg' }

  const { userId } = await auth()
  if (!userId) return { error: 'Niet ingelogd' }

  await db`INSERT INTO ideeen (user_id, inhoud) VALUES (${userId}, ${inhoud})`
  return {}
}

export async function stuurPubliekIdee(formData: FormData): Promise<{ error?: string }> {
  const inhoud = (formData.get('inhoud') as string)?.trim()
  if (!inhoud) return { error: 'Leeg' }
  if (inhoud.length > 1000) return { error: 'Te lang' }

  await db`INSERT INTO ideeen (inhoud) VALUES (${inhoud})`
  return {}
}
