import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LEARN_COMPLETION_STORAGE_KEY,
  didPassLearnChallenge,
  learnCompletionId,
  markLearnChallengeComplete,
  readLearnCompletions,
} from './learnProgress.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
  }
}

test('challenge completion is tracked separately for each key', () => {
  const storage = memoryStorage()
  const completed = markLearnChallengeComplete(storage, new Set(), 'C', 'I-IV-V-I')

  assert.equal(completed.has(learnCompletionId('C', 'I-IV-V-I')), true)
  assert.equal(completed.has(learnCompletionId('G', 'I-IV-V-I')), false)
})

test('a challenge only passes when every step is guessed correctly', () => {
  assert.equal(didPassLearnChallenge([
    { correct: true },
    { correct: true },
    { correct: true },
  ], 3), true)

  assert.equal(didPassLearnChallenge([
    { correct: true },
    { correct: false },
    { correct: true },
  ], 3), false)

  assert.equal(didPassLearnChallenge([{ correct: true }], 3), false)
})

test('completed challenges persist when progress is read again', () => {
  const storage = memoryStorage()
  const first = markLearnChallengeComplete(storage, new Set(), 'C', 'ii-V-I')
  markLearnChallengeComplete(storage, first, 'G', 'ii-V-I')

  assert.deepEqual(
    [...readLearnCompletions(storage)].sort(),
    ['C:ii-V-I', 'G:ii-V-I'],
  )
})

test('missing or invalid stored completion data is treated as empty', () => {
  assert.deepEqual([...readLearnCompletions(memoryStorage())], [])
  assert.deepEqual([
    ...readLearnCompletions(memoryStorage({ [LEARN_COMPLETION_STORAGE_KEY]: '{bad json' })),
  ], [])
})
