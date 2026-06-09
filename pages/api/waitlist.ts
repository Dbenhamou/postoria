import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../lib/auth-helper'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const userId = await requireAuth(req, res)
  if (!userId) return

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requis' })

  await supabase.from('profiles').update({ waitlist_team: true } as any).eq('id', userId)

  // Email de notification interne
  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Ecrira <notifications@ecrira.com>',
        to: ['contact@ecrira.com'],
        subject: '🎯 Nouvelle inscription waitlist Team',
        html: `<p><strong>${email}</strong> s'est inscrit sur la waitlist Team.</p>`,
      }),
    }).catch(()=>{})
  }

  res.status(200).json({ success: true })
}
