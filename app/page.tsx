export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="px-8 py-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ background: "linear-gradient(225deg, #7db4c3, #6895a2)" }}
            />
            <span className="text-lg font-semibold text-black tracking-tight">
              Plug-in Recruitment
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-black hover:underline">
              Inloggen
            </a>
            <a
              href="/signup"
              className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(225deg, #7db4c3, #6895a2)" }}
            >
              Gratis starten
            </a>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-semibold text-black mb-4">
          Recrootools
        </h1>
        <p className="text-lg mb-16" style={{ color: "#9ba3a9" }}>
          Tools die recruiters echt gebruiken
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-100 p-6 bg-gray-50 text-center">
            <p className="text-sm" style={{ color: "#9ba3a9" }}>
              Binnenkort beschikbaar
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
