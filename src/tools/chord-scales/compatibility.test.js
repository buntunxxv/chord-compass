import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CHORD_TYPES,
  ROOTS,
  SCALE_TYPES,
  getChordsInScale,
  getCompatibleScales,
  pitchesFromIntervals,
} from './compatibility.js'

test('every supported chord has at least one compatible same-root scale', () => {
  ROOTS.forEach(root => CHORD_TYPES.forEach(chordType => {
    assert.ok(getCompatibleScales(root, chordType).length > 0, `${root}${chordType.symbol}`)
  }))
})

test('every supported scale produces at least one triad', () => {
  ROOTS.forEach(root => SCALE_TYPES.forEach(scaleType => {
    assert.ok(getChordsInScale(root, scaleType).length > 0, `${root} ${scaleType.name}`)
  }))
})

test('C major produces the seven expected diatonic triads', () => {
  assert.deepEqual(
    getChordsInScale('C', SCALE_TYPES.find(type => type.name === 'major')).map(result => result.name),
    ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']
  )
})

test('intervals become ascending preview pitches from the selected root', () => {
  assert.deepEqual(pitchesFromIntervals('C', ['1P', '3M', '5P']), ['C4', 'E4', 'G4'])
})
