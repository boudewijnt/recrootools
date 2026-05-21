'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL, ADMIN_EMAIL } from '@/lib/resend'

const MAX_USERS = 100

export async function signup(formData: FormData) {
  const admin = createAdminClient()
  const { data } = await admin.auth.admin.listUsers({ perPage: MAX_USERS + 1 })
  if ((data?.users?.length ?? 0) >= MAX_USERS) {
    redirect(`/signup?error=${encodeURIComponent('Aanmelden is tijdelijk gesloten. De bèta zit op maximale capaciteit (100 gebruikers). Probeer het later opnieuw.')}`)
  }

  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (signUpData.user) {
    await admin.from('profiles').upsert({ id: signUpData.user.id, full_name: fullName })

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nieuwe aanmelding: ${fullName}`,
      html: `<p>Er heeft zich een nieuwe gebruiker aangemeld op Recrootools:</p>
<ul>
  <li><strong>Naam:</strong> ${fullName}</li>
  <li><strong>E-mail:</strong> ${email}</li>
</ul>`,
    })
  }

  redirect('/signup/bevestig')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
