import { useState } from 'react'
import { PROGRESSION_TEMPLATES } from '../progressionTemplates'
import { resolveTemplate } from '../utils/resolveTemplate'
import { ROOTS, ROOT_DISPLAY } from './ChordSelector'
import Dropdown from './Dropdown'
import './ProgressionTemplates.css'

const MOODS = ['All', ...PROGRESSION_TEMPLATES.map(t => t.mood)]

export default function ProgressionTemplates({ keyRoot, keyMode, onKeyRootChange, onKeyModeChange, onLoad }) {
  const [moodFilter, setMoodFilter] = useState('All')

  const visibleTemplates = moodFilter === 'All'
    ? PROGRESSION_TEMPLATES
    : PROGRESSION_TEMPLATES.filter(t => t.mood === moodFilter)

  function handleLoad(template, entries) {
    if (entries) onLoad(entries, template)
  }

  return (
    <div className="progression-templates" id="wt-progression-templates">
      <h2 className="progression-templates__title">Progression Templates</h2>
      <span className="progression-templates__hint">Pick a key, then load a named progression built from it</span>

      <div className="progression-templates__key">
        <div className="progression-templates__key-field">
          <label className="progression-templates__label">Key</label>
          <Dropdown
            value={keyRoot}
            onChange={onKeyRootChange}
            options={ROOTS.map((r, i) => ({ value: r, label: ROOT_DISPLAY[i] }))}
          />
        </div>
        <div className="progression-templates__mode-toggle" role="group" aria-label="Key mode">
          <button
            type="button"
            className={`progression-templates__mode-btn ${keyMode === 'major' ? 'progression-templates__mode-btn--active' : ''}`}
            onClick={() => onKeyModeChange('major')}
          >
            Major
          </button>
          <button
            type="button"
            className={`progression-templates__mode-btn ${keyMode === 'minor' ? 'progression-templates__mode-btn--active' : ''}`}
            onClick={() => onKeyModeChange('minor')}
          >
            Minor
          </button>
        </div>
      </div>

      <div className="progression-templates__mood-filter">
        {MOODS.map(mood => (
          <button
            key={mood}
            type="button"
            className={`progression-templates__mood-chip ${moodFilter === mood ? 'progression-templates__mood-chip--active' : ''}`}
            onClick={() => setMoodFilter(mood)}
          >
            {mood}
          </button>
        ))}
      </div>

      <div className="progression-templates__list">
        {visibleTemplates.map(template => {
          const modeMatches = template.mode === keyMode
          const resolved = modeMatches ? resolveTemplate(template, keyRoot, keyMode) : null
          return (
            <div key={template.name} className="progression-templates__card">
              <div className="progression-templates__card-header">
                <span className="progression-templates__card-name">{template.name}</span>
                <span className="progression-templates__mood-badge">{template.mood}</span>
              </div>
              {resolved ? (
                <div className="progression-templates__degrees">
                  {resolved.map((entry, i) => (
                    <span key={i} className="progression-templates__resolved-chord">
                      <span className="progression-templates__resolved-chord-name">{entry.chord}</span>
                      <span className="progression-templates__degree-pill">{entry.degree}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="progression-templates__degrees progression-templates__degrees--plain">{template.degrees.join(' – ')}</span>
              )}
              <p className="progression-templates__description">{template.description}</p>
              <button
                type="button"
                className="progression-templates__load-btn"
                onClick={() => handleLoad(template, resolved)}
                disabled={!modeMatches}
                title={modeMatches ? undefined : `Switch to a ${template.mode} key to load this progression`}
              >
                {modeMatches ? 'Load' : `Needs a ${template.mode} key`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
