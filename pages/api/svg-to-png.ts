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
    const chromium = await import('@sparticuz/chromium')
    const puppeteer = await import('puppeteer-core')

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1080, height: 1350 },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1350 })

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{width:1080px;height:1350px;overflow:hidden}</style></head><body>${svgContent}</body></html>`
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pngBuffer = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350 } })
    await browser.close()

    const base64 = Buffer.from(pngBuffer).toString('base64')
    return res.status(200).json({ base64 })
  } catch (err: any) {
    console.error('[svg-to-png]', err)
    return res.status(500).json({ error: err.message || 'Conversion échouée' })
  }
}
