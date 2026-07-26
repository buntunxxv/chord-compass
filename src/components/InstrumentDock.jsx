import { useState, useEffect } from 'react'
import PianoDisplay from './PianoDisplay'
import GuitarDisplay from './GuitarDisplay'
import './InstrumentDock.css'

export default function InstrumentDock({ chordNotes, previewNotes, root, guitarShape }) {
  const [tab, setTab] = useState('keys')

  useEffect(() => {
    if (!guitarShape && tab === 'frets') setTab('keys')
  }, [guitarShape, tab])

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
          disabled={!guitarShape}
          title={!guitarShape ? 'No guitar shape for this chord yet' : undefined}
        >
          Guitar
        </button>
      </div>
      <div className="instrument-dock__view">
        {tab === 'keys' ? (
          <PianoDisplay chordNotes={chordNotes} previewNotes={previewNotes} compact />
        ) : (
          <GuitarDisplay root={root} shape={guitarShape} notes={chordNotes} compact />
        )}
      </div>
    </div>
  )
}
