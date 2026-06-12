import { getAuthUserId } from '@/lib/auth'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { url } = await request.json()
  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'Geen geldige URL opgegeven' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
    })

    if (!res.ok) {
      return Response.json({ error: 'Kon de URL niet ophalen' }, { status: 502 })
    }

    const tekst = await res.text()

    if (!tekst || tekst.trim().length < 50) {
      return Response.json({ error: 'Pagina bevat te weinig tekst om te analyseren' }, { status: 422 })
    }

    return Response.json({ tekst })
  } catch {
    return Response.json({ error: 'Verbinding met de URL mislukt' }, { status: 502 })
  }
}
