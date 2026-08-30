// One-time migration from the old "Chord Compass" localStorage keys to the
// "Chord Moves" ones, so existing users keep their saved progressions, Pro
// unlock, theme preference, and onboarding/learn-progress state across the
// rename. Call once at startup, before anything else reads a key.
const KEY_RENAMES = [
  ['kcc_tier', 'cm_tier'],
  ['kcc_path', 'cm_path'],
  ['chordCompassSavedProgressions', 'chordMovesSavedProgressions'],
  ['chordCompassThemePreference', 'chordMovesThemePreference'],
  ['chordCompassProgression', 'chordMovesProgression'],
  ['kcc_seen_intro_v3', 'cm_seen_intro_v3'],
  ['kcc_seen_learn_intro', 'cm_seen_learn_intro'],
  ['kcc_completed_learn_challenges_v2', 'cm_completed_learn_challenges_v2'],
]

export function migrateStorageKeys(storage) {
  for (const [oldKey, newKey] of KEY_RENAMES) {
    if (storage.getItem(newKey) !== null) continue
    const value = storage.getItem(oldKey)
    if (value === null) continue
    storage.setItem(newKey, value)
    storage.removeItem(oldKey)
  }
}
