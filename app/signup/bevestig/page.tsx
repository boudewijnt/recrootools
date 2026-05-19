export default function BevestigPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div
          className="w-8 h-8 rounded-full mx-auto mb-6"
          style={{ background: 'linear-gradient(225deg, #7db4c3, #6895a2)' }}
        />
        <h1 className="text-2xl font-semibold text-black mb-3">
          Bevestig je e-mailadres
        </h1>
        <p className="text-sm mb-2" style={{ color: '#9ba3a9' }}>
          We hebben een bevestigingslink gestuurd naar je e-mailadres.
        </p>
        <p className="text-sm" style={{ color: '#9ba3a9' }}>
          Klik op de link in de mail om je Recrootools-account te activeren.
        </p>
        <p className="mt-8 text-sm" style={{ color: '#9ba3a9' }}>
          Al bevestigd?{' '}
          <a href="/login" className="text-black font-medium hover:underline">
            Inloggen
          </a>
        </p>
      </div>
    </main>
  )
}
