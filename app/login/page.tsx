import { login } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div
            className="w-8 h-8 rounded-full mb-6"
            style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
          />
          <h1 className="text-2xl font-semibold text-black mb-1">Inloggen</h1>
          <p className="text-sm" style={{ color: '#9ba3a9' }}>
            Welkom terug bij Recrootools
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1.5">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jan@bureau.nl"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1.5">
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
          >
            Inloggen
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#9ba3a9' }}>
          Nog geen account?{' '}
          <a href="/signup" className="text-black font-medium hover:underline">
            Gratis aanmelden
          </a>
        </p>
      </div>
    </main>
  )
}
