import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../lib/auth-helper'

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const userId = await requireAuth(req, res)
  if (!userId) return

  const { svgContent } = req.body
  if (!svgContent || typeof svgContent !== 'string') {
    return res.status(400).json({ error: 'svgContent manquant' })
  }

  try {
    const { Resvg } = await import('@resvg/resvg-js')
    const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: 1080 } })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()
    const base64 = Buffer.from(pngBuffer).toString('base64')
    return res.status(200).json({ base64 })
  } catch (err: any) {
    console.error('[svg-to-png]', err)
    return res.status(500).json({ error: err.message || 'Conversion échouée' })
  }
}
