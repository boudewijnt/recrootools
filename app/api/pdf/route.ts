import { NextRequest } from 'next/server'
import { generatePDF } from '@/lib/pdf-generator'
import type { AnalyseData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const data: AnalyseData = await request.json()

    if (!data?.analyse || !data?.context) {
      return Response.json({ error: 'Ongeldige analysedata' }, { status: 400 })
    }

    const pdfBuffer = await generatePDF(data)

    const functietitel = data.context.functietitel || 'Vacature'
    const bedrijfsnaam = data.context.bedrijfsnaam || 'Onbekend'
    const filename = `Vacature Analyse ${functietitel} - ${bedrijfsnaam}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error('PDF fout:', error)
    return Response.json(
      { error: 'PDF genereren mislukt. Probeer het opnieuw.' },
      { status: 500 }
    )
  }
}
