import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VacatureAnalyseClient from './client'

export default async function VacatureAnalysePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <VacatureAnalyseClient />
}
