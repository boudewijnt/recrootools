'use client'

import { useState } from 'react'

export default function Paywall() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleKoop() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/mollie/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError('Kon betaalpagina niet openen. Probeer opnieuw.')
        setLoading(false)
      }
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 18, 20, 0.92)' }}
    >
      <div
        className="max-w-sm w-full mx-4 rounded-2xl p-8 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-muted)' }}
        >
          ✦
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Je gratis analyses zijn op
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Je hebt je 5 gratis analyses gebruikt. Koop een pakket van 10 analyses voor €20 en ga verder.
        </p>
        {error && (
          <p className="text-sm mb-4" style={{ color: '#f87171' }}>{error}</p>
        )}
        <button
          onClick={handleKoop}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Doorsturen naar betaling…' : '10 analyses kopen — €20'}
        </button>
        <p className="mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>
          iDEAL, creditcard en meer · Veilig via Mollie
        </p>
      </div>
    </div>
  )
}
