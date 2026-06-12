import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  return userId
}

export async function requireAdmin(): Promise<string> {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  if (email !== process.env.ADMIN_EMAIL) redirect('/dashboard')
  return userId
}

export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}
