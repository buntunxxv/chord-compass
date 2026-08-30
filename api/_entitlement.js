// Shared entitlement lookup, used by both check-entitlement.js and
// verify-unlock-code.js so the "is this email Pro" query lives in one place.
export async function lookupIsPro(supabase, normalizedEmail) {
  const { data, error } = await supabase
    .from('chord_moves_entitlements')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    console.error('Supabase query error:', error)
    throw new Error('Database error')
  }

  return !!data
}
