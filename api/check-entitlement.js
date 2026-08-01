import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email required' })

  const normalizedEmail = email.trim().toLowerCase()

  const supabase = createClient(
    'https://lkkcmiywhwnquqysyghb.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('chord_compass_entitlements')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    console.error('Supabase query error:', error)
    return res.status(500).json({ error: 'Database error' })
  }

  return res.status(200).json({ isPro: !!data })
}
