import { useState, useEffect } from 'react'
import PianoDisplay from './PianoDisplay'
import GuitarDisplay from './GuitarDisplay'
import './InstrumentDock.css'

export default function InstrumentDock({ chordNotes, previewNotes, root, guitarShape, guitarSlashNotice, guitarInversionUnavailable, guitarPositions, isPro }) {
  const [tab, setTab] = useState('keys')
  const [positionIndex, setPositionIndex] = useState(0)
  const canShowFrets = !guitarInversionUnavailable && (!!guitarShape || guitarSlashNotice)

  useEffect(() => {
    if (!canShowFrets && tab === 'frets') setTab('keys')
  }, [canShowFrets, tab])

  // A new chord (or leaving/re-entering root position) always starts back
  // at position 1 -- guitarShape is the same static object reference for a
  // given chord (it's a plain import), so it changes identity exactly when
  // the chord does.
  useEffect(() => {
    setPositionIndex(0)
  }, [guitarShape])

  const hasPositions = Array.isArray(guitarPositions) && guitarPositions.length > 1
  // Position 1 is always free; positions 2+ are Pro-gated. Clamping here
  // (not just disabling the "next" control) means a free user can never
  // actually be shown position 2/3, even if positionIndex state somehow
  // held a stale non-zero value -- the same defense-in-depth pattern
  // already used for effectiveBassNote in App.jsx.
  const maxAllowedIndex = hasPositions ? (isPro ? guitarPositions.length - 1 : 0) : 0
  const activeIndex = Math.min(positionIndex, maxAllowedIndex)
  const activeShape = hasPositions ? guitarPositions[activeIndex] : guitarShape

  function goToPrevPosition() {
    if (!isPro) return
    setPositionIndex(i => Math.max(0, i - 1))
  }
  function goToNextPosition() {
    if (!isPro || !hasPositions) return
    setPositionIndex(i => Math.min(guitarPositions.length - 1, i + 1))
  }

  return (
    <div className="instrument-dock">
      <div className="instrument-dock__tabs" role="tablist" aria-label="Instrument view">
        <button
          id="wt-keys-tab"
          type="button"
          role="tab"
          aria-selected={tab === 'keys'}
          className={`instrument-dock__tab ${tab === 'keys' ? 'instrument-dock__tab--active' : ''}`}
          onClick={() => setTab('keys')}
        >
          Keys
        </button>
        <button
          id="wt-frets-tab"
          type="button"
          role="tab"
          aria-selected={tab === 'frets'}
          className={`instrument-dock__tab ${tab === 'frets' ? 'instrument-dock__tab--active' : ''}`}
          onClick={() => setTab('frets')}
          disabled={!canShowFrets}
          title={
            guitarInversionUnavailable ? 'No clean guitar fingering exists for this inversion'
              : guitarSlashNotice ? 'Guitar shapes for slash chords coming soon'
                : (!guitarShape ? 'No guitar shape for this chord yet' : undefined)
          }
        >
          Guitar
        </button>
      </div>
      <div className="instrument-dock__view">
        {tab === 'keys' ? (
          <PianoDisplay chordNotes={chordNotes} previewNotes={previewNotes} compact />
        ) : guitarSlashNotice ? (
          <p className="instrument-dock__guitar-notice">Guitar shapes for slash chords coming soon</p>
        ) : (
          <div className="instrument-dock__guitar-view">
            <GuitarDisplay root={root} shape={activeShape} notes={chordNotes} compact />
            {hasPositions && (
              <div className="instrument-dock__position-selector">
                <button
                  type="button"
                  id="wt-position-prev"
                  className="instrument-dock__position-btn"
                  onClick={goToPrevPosition}
                  disabled={activeIndex === 0}
                  aria-label="Previous neck position"
                >
                  ‹
                </button>
                <span className="instrument-dock__position-label">
                  {activeIndex + 1}/{guitarPositions.length}
                </span>
                {!isPro && (
                  <span className="instrument-dock__position-badge">PRO</span>
                )}
                <button
                  type="button"
                  id="wt-position-next"
                  className="instrument-dock__position-btn"
                  onClick={goToNextPosition}
                  disabled={!isPro || activeIndex === guitarPositions.length - 1}
                  aria-label="Next neck position"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
