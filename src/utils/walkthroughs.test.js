import test from 'node:test'
import assert from 'node:assert/strict'
import {
  WALKTHROUGH_CONFIGS,
  shouldAutoOpenWalkthrough,
  walkthroughFlowForPath,
} from './walkthroughs.js'

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

test('Learn walkthrough has its own three-step sequence and storage flag', () => {
  assert.equal(WALKTHROUGH_CONFIGS.learn.storageKey, 'kcc_seen_learn_intro')
  assert.notEqual(WALKTHROUGH_CONFIGS.learn.storageKey, WALKTHROUGH_CONFIGS.build.storageKey)
  assert.deepEqual(
    WALKTHROUGH_CONFIGS.learn.steps.map(step => step.selector),
    ['#wt-learn-key-picker', '#wt-learn-challenge-list', '#wt-learn-step-picker'],
  )
})

test('Learn walkthrough opens on first visit but not after it has been seen', () => {
  const storage = memoryStorage()
  assert.equal(shouldAutoOpenWalkthrough('learn', storage), true)

  storage.setItem(WALKTHROUGH_CONFIGS.learn.storageKey, '1')
  assert.equal(shouldAutoOpenWalkthrough('learn', storage), false)
})

test('Build and Learn first-visit flags are independent', () => {
  const storage = memoryStorage({ [WALKTHROUGH_CONFIGS.build.storageKey]: '1' })
  assert.equal(shouldAutoOpenWalkthrough('build', storage), false)
  assert.equal(shouldAutoOpenWalkthrough('learn', storage), true)
  assert.equal(walkthroughFlowForPath('learn'), 'learn')
  assert.equal(walkthroughFlowForPath('build'), 'build')
})
