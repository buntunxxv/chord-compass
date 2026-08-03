import { useState, useEffect } from 'react'
import PianoDisplay from './PianoDisplay'
import GuitarDisplay from './GuitarDisplay'
import './InstrumentDock.css'

export default function InstrumentDock({ chordNotes, previewNotes, root, guitarShape, guitarSlashNotice }) {
  const [tab, setTab] = useState('keys')
  const canShowFrets = !!guitarShape || guitarSlashNotice

  useEffect(() => {
    if (!canShowFrets && tab === 'frets') setTab('keys')
  }, [canShowFrets, tab])

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
          title={guitarSlashNotice ? 'Guitar shapes for slash chords coming soon' : (!guitarShape ? 'No guitar shape for this chord yet' : undefined)}
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
          <GuitarDisplay root={root} shape={guitarShape} notes={chordNotes} compact />
        )}
      </div>
    </div>
  )
}
