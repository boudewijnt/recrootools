import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <SignUp
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: '#006f66',
            colorBackground: '#111c1e',
            colorInputBackground: '#0d1618',
            colorInputText: '#ffffff',
            colorTextSecondary: '#9ba3a9',
          } as Record<string, string>,
        }}
      />
    </main>
  )
}
