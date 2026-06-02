import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { content, webhookUrl, scheduledAt } = req.body

  if (!webhookUrl) return res.status(400).json({ error: 'URL webhook manquante' })
  if (!content) return res.status(400).json({ error: 'Contenu manquant' })

  // Si une date est fournie → on planifie dans Supabase
  if (scheduledAt) {
    const { error } = await supabase
      .from('scheduled_posts')
      .insert([{ content, webhook_url: webhookUrl, scheduled_at: scheduledAt, status: 'pending' }])

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, message: 'Post planifié ✓', scheduled: true })
  }

  // Sinon → publication immédiate
  try {
    const zapRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        published_at: new Date().toISOString(),
        source: 'Postoria',
      }),
    })

    if (!zapRes.ok) throw new Error(`Zapier a répondu ${zapRes.status}`)
    res.status(200).json({ success: true, message: 'Post publié sur LinkedIn ✓' })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
