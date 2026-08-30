import test from 'node:test'
import assert from 'node:assert/strict'
import { migrateStorageKeys } from './migrateStorageKeys.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

test('copies every old Chord Compass key to its Chord Moves name and drops the old one', () => {
  const storage = memoryStorage({
    kcc_tier: 'pro',
    kcc_path: 'learn',
    chordCompassSavedProgressions: '[{"id":1}]',
    chordCompassThemePreference: 'dark',
    chordCompassProgression: '["Cmaj7"]',
    kcc_seen_intro_v3: '1',
    kcc_seen_learn_intro: '1',
    kcc_completed_learn_challenges_v2: '["C:1"]',
  })

  migrateStorageKeys(storage)

  assert.equal(storage.getItem('cm_tier'), 'pro')
  assert.equal(storage.getItem('cm_path'), 'learn')
  assert.equal(storage.getItem('chordMovesSavedProgressions'), '[{"id":1}]')
  assert.equal(storage.getItem('chordMovesThemePreference'), 'dark')
  assert.equal(storage.getItem('chordMovesProgression'), '["Cmaj7"]')
  assert.equal(storage.getItem('cm_seen_intro_v3'), '1')
  assert.equal(storage.getItem('cm_seen_learn_intro'), '1')
  assert.equal(storage.getItem('cm_completed_learn_challenges_v2'), '["C:1"]')

  assert.equal(storage.getItem('kcc_tier'), null)
  assert.equal(storage.getItem('kcc_path'), null)
  assert.equal(storage.getItem('chordCompassSavedProgressions'), null)
})

test('a fresh visitor with no old keys ends up with nothing new written', () => {
  const storage = memoryStorage()
  migrateStorageKeys(storage)
  assert.equal(storage.getItem('cm_tier'), null)
  assert.equal(storage.getItem('cm_path'), null)
})

test('never overwrites a new key that already has a value', () => {
  const storage = memoryStorage({ kcc_tier: 'pro', cm_tier: 'free' })
  migrateStorageKeys(storage)
  assert.equal(storage.getItem('cm_tier'), 'free')
})
