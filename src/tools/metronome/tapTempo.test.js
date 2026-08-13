import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateTapBpm } from './tapTempo.js'

test('requires at least two taps', () => {
  assert.equal(calculateTapBpm([]), null)
  assert.equal(calculateTapBpm([1000]), null)
})

test('calculates tempo from evenly spaced taps', () => {
  assert.equal(calculateTapBpm([0, 500, 1000, 1500]), 120)
  assert.equal(calculateTapBpm([0, 1000, 2000]), 60)
})

test('averages uneven human taps', () => {
  assert.equal(calculateTapBpm([0, 490, 1005, 1500]), 120)
})

test('rejects repeated or out-of-order timestamps', () => {
  assert.equal(calculateTapBpm([1000, 1000]), null)
  assert.equal(calculateTapBpm([1000, 900]), null)
})
