import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function fetchCyberNews(): Promise<string> {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=cybersecurity+MSP+ransomware+vulnerability&language=fr&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    )
    const data = await res.json()
    if (!data.articles?.length) return ''
    return data.articles
      .map((a: { title: string; description: string }) => `- ${a.title}: ${a.description || ''}`)
      .join('\n')
  } catch {
    return ''
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { profile } = req.body
  const news = await fetchCyberNews()

  const systemPrompt = `Tu es un expert en personal branding LinkedIn spécialisé en cybersécurité B2B.
Utilisateur : ${profile?.role || 'Account Executive'} chez ${profile?.company || 'Cyna'}.
Secteur : ${profile?.sector || 'Cybersécurité B2B – partenaires MSP'}.
Audience : ${profile?.audience || 'Professionnels MSP, DSI, RSSI – France'}.
Stack : ${profile?.tech_stack || 'Microsoft, Azure, Entra ID'}.
${profile?.domain ? `Domaine entreprise : ${profile.domain}.` : ''}
Langue : Français.`

  const userPrompt = `${news ? `Actualités cybersécurité du jour :\n${news}\n\n` : ''}
Génère exactement 10 idées de posts LinkedIn pour aujourd'hui.
Couvre : actualité récente, conseil Zero Trust/MFA, CVE Microsoft/Azure, ransomware terrain, tendance MSP France.
Les 2 premières idées doivent être les plus pertinentes et percutantes du moment.

Format JSON strict (tableau de 10 objets) :
[{"topic":"étiquette courte","title":"titre accrocheur max 12 mots","hook":"première phrase percutante max 25 mots","recommended":true}]

Les 2 premiers objets ont "recommended":true, les 8 suivants ont "recommended":false.
Réponds UNIQUEMENT avec le JSON valide.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = (message.content[0] as { text: string }).text
    const clean = raw.replace(/```json|```/g, '').trim()
    const ideas = JSON.parse(clean)

    res.status(200).json({ ideas, hasNews: !!news })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur génération idées' })
  }
}
