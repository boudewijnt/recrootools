'use client'

import { useState } from 'react'
import { stuurIdee } from '@/app/actions/ideeen'

type Status = 'idle' | 'laden' | 'succes' | 'fout'

export default function IdeeBus() {
  const [inhoud, setInhoud] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleVerstuur(e: React.FormEvent) {
    e.preventDefault()
    if (!inhoud.trim()) return
    setStatus('laden')
    const formData = new FormData()
    formData.set('inhoud', inhoud)
    const result = await stuurIdee(formData)
    if (result.error) {
      setStatus('fout')
    } else {
      setStatus('succes')
      setInhoud('')
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 p-6 bg-white">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shrink-0"
          style={{ backgroundColor: '#006f66' }}
        >
          ✦
        </div>
        <div>
          <h2 className="font-semibold text-black">Ideeënbus</h2>
          <p className="text-sm mt-0.5" style={{ color: '#9ba3a9' }}>
            Welke tool zou jouw werk als recruiter makkelijker maken? Geen idee is te gek.
          </p>
        </div>
      </div>

      {status === 'succes' ? (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: '#f2f7f8', color: '#006f66' }}
        >
          Bedankt! Je idee is ontvangen — we nemen het mee.
        </div>
      ) : (
        <form onSubmit={handleVerstuur}>
          <textarea
            value={inhoud}
            onChange={(e) => setInhoud(e.target.value)}
            placeholder="Beschrijf je idee zo concreet of vaag als je wilt…"
            className="w-full h-28 text-sm text-gray-900 px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:border-[#006f66] transition-colors"
          />

          {status === 'fout' && (
            <p className="text-sm mt-2" style={{ color: '#c0392b' }}>
              Er ging iets mis. Probeer het opnieuw.
            </p>
          )}

          <button
            type="submit"
            disabled={!inhoud.trim() || status === 'laden'}
            className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#006f66' }}
          >
            {status === 'laden' ? 'Versturen…' : 'Idee insturen'}
          </button>
        </form>
      )}
    </div>
  )
}
