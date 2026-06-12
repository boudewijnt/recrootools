import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <SignUp />
    </main>
  )
}
