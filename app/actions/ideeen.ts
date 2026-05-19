'use server'

import { createClient } from '@/lib/supabase/server'

export async function stuurIdee(formData: FormData): Promise<{ error?: string }> {
  const inhoud = (formData.get('inhoud') as string)?.trim()
  if (!inhoud) return { error: 'Leeg' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('ideeen')
    .insert({ user_id: user.id, inhoud })

  if (error) return { error: error.message }
  return {}
}
