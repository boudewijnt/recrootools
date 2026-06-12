import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import VacatureAnalyseClient from './client'

export default async function VacatureAnalysePage() {
  const userId = await requireAuth()

  const [user] = await db`SELECT analyses_credits FROM users WHERE id = ${userId}`
  const credits = user ? Number(user.analyses_credits) : 0

  return <VacatureAnalyseClient credits={credits} />
}
