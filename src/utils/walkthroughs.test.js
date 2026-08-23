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

test('Build walkthrough walks the three pages, ending at the progression bar', () => {
  assert.deepEqual(
    WALKTHROUGH_CONFIGS.build.steps.map(step => step.selector),
    ['#wt-workspace-nav', '#wt-root', '#wt-play-btn', '#wt-tab-find', '#wt-note-picker', '#wt-progression'],
  )
})

test('Build walkthrough moves to Identify by making you tap the tab', () => {
  // The step after #wt-tab-find spotlights something on the Identify slide, so
  // that tab step has to be action-gated: tapping it is what actually changes
  // the page. A narration step there would advance to a target that is still
  // inert and off-screen.
  const steps = WALKTHROUGH_CONFIGS.build.steps
  const tabStep = steps.findIndex(step => step.selector === '#wt-tab-find')
  assert.equal(steps[tabStep].action, true)
  assert.equal(steps[tabStep + 1].selector, '#wt-note-picker')
})

test('Build walkthrough storage key was bumped so v2 viewers see the new tour', () => {
  assert.equal(WALKTHROUGH_CONFIGS.build.storageKey, 'kcc_seen_intro_v3')
})
