// v1 marked any fully revealed attempt complete, even when it contained
// wrong guesses. Starting a fresh key prevents those false-positive marks
// from surviving after completion becomes accuracy-based.
export const LEARN_COMPLETION_STORAGE_KEY = 'kcc_completed_learn_challenges_v2'

export function learnCompletionId(keyRoot, challengeId) {
  return `${keyRoot}:${challengeId}`
}

export function didPassLearnChallenge(guesses, stepCount) {
  if (!Number.isInteger(stepCount) || stepCount <= 0) return false
  return Array.from({ length: stepCount }, (_, index) => guesses[index]?.correct === true).every(Boolean)
}

export function readLearnCompletions(storage) {
  try {
    const stored = JSON.parse(storage.getItem(LEARN_COMPLETION_STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(stored) ? stored.filter(value => typeof value === 'string') : [])
  } catch {
    return new Set()
  }
}

export function markLearnChallengeComplete(storage, completions, keyRoot, challengeId) {
  const next = new Set(completions)
  next.add(learnCompletionId(keyRoot, challengeId))
  storage.setItem(LEARN_COMPLETION_STORAGE_KEY, JSON.stringify([...next].sort()))
  return next
}
