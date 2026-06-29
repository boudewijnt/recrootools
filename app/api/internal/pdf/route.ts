import { NextRequest } from 'next/server'
import { generatePDF } from '@/lib/pdf-generator'
import type { AnalyseResult, VacatureContext } from '@/lib/types'

function checkApiKey(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.INTERNAL_API_KEY}`
}

export async function POST(request: NextRequest) {
  if (!checkApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { context, analyse, vacaturetekst = '' }: {
    context: VacatureContext
    analyse: AnalyseResult
    vacaturetekst?: string
  } = await request.json()

  if (!context || !analyse) {
    return Response.json({ error: 'context en analyse zijn verplicht' }, { status: 400 })
  }

  const pdfBuffer = await generatePDF({ vacaturetekst, context, analyse })

  const functietitel = context.functietitel || 'Vacature'
  const bedrijfsnaam = context.bedrijfsnaam || 'Onbekend'
  const filename = `Vacature Analyse ${functietitel} - ${bedrijfsnaam}.pdf`

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  })
}
