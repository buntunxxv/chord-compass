import { createClient } from '@supabase/supabase-js'
import { lookupIsPro } from './_entitlement.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, code } = req.body
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email required' })
  if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code required' })

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = code.trim()

  const supabase = createClient(
    'https://lkkcmiywhwnquqysyghb.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Most recent code for this email, whether or not it matches -- lets us
  // tell "wrong code" apart from "no code was ever requested".
  const { data: unlockCode, error: fetchError } = await supabase
    .from('chord_moves_unlock_codes')
    .select('id, code, expires_at, used')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    console.error('Supabase query error:', fetchError)
    return res.status(500).json({ error: 'Database error' })
  }

  if (!unlockCode || unlockCode.code !== normalizedCode) {
    return res.status(400).json({ error: 'Incorrect code — check the email and try again.' })
  }

  if (unlockCode.used) {
    return res.status(400).json({ error: 'That code has already been used — request a new one.' })
  }

  if (new Date(unlockCode.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'That code has expired — request a new one.' })
  }

  // Mark used before the entitlement lookup so a code can never unlock
  // twice, even if the lookup below fails partway through.
  const { error: updateError } = await supabase
    .from('chord_moves_unlock_codes')
    .update({ used: true })
    .eq('id', unlockCode.id)

  if (updateError) {
    console.error('Supabase update error:', updateError)
    return res.status(500).json({ error: 'Database error' })
  }

  let isPro
  try {
    isPro = await lookupIsPro(supabase, normalizedEmail)
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }

  return res.status(200).json({ isPro })
}
