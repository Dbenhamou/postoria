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
  if (!scheduledAt) return res.status(400).json({ error: 'Date manquante' })

  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert([{ content, webhook_url: webhookUrl, scheduled_at: scheduledAt, status: 'pending' }])
    .select()

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json({ success: true, post: data[0] })
}
