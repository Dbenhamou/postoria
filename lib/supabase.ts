import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id?: string
  name: string
  role: string
  company: string
  sector: string
  audience: string
  tech_stack: string
  lang: string
  webhook_url: string
  domain: string
  brand_bg: string
  brand_text: string
  brand_accent: string
}
