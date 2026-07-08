import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './AdminFeedback.css'

const QUESTION_LABELS = {
  // Round 2 (current)
  q1: 'What did you think Chord Compass was helping you do?',
  q2: 'Could you build a 4-chord progression without help?',
  q3: 'Did the suggested chord cards help you decide what to add next?',
  q4: 'Did the notes shown on each suggested chord help, or was it too much?',
  q5: 'Did the song direction labels make sense?',
  q6: 'Did hearing the full progression help you understand the chord movement?',
  q7: 'What confused you?',
  q8: 'What would make you come back and use this again?',
  q9: 'What did you expect Pro features to include?',
  q10: 'Would you pay for a deeper version?',
  level: 'Level-specific question',
  // Round 1 — beginner
  b1: '[R1] What did you think CC was for?',
  b2: '[R1] How clear was the interface?',
  b3: '[R1] Did the suggested chords help?',
  b4: '[R1] Did the notes help?',
  b5: '[R1] Did direction labels make sense?',
  b6: '[R1] What confused you?',
  b7: '[R1] What would help you learn most?',
  // Round 1 — intermediate
  i1: '[R1] Did you find useful chords?',
  i2: '[R1] Did suggested chords help?',
  i3: '[R1] Did chord direction labels help?',
  i4: '[R1] Were direction labels good?',
  i5: '[R1] What features would be most useful?',
  i6: '[R1] What was unclear?',
  i7: '[R1] What genre do you write?',
  i8: '[R1] Would you pay for a pro version?',
}

const TYPE_COLOR = {
  beginner: '#119392',
  intermediate: '#7C3AED',
  advanced: '#DC2626',
}

function formatDate(iso) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function AdminFeedback() {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(new Set())

  useEffect(() => {
    supabase
      .from('chord_compass_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setResponses(data || [])
        setLoading(false)
      })
  }, [])

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = filter === 'all' ? responses : responses.filter(r => r.user_type === filter)
  const counts = responses.reduce((acc, r) => ({ ...acc, [r.user_type]: (acc[r.user_type] || 0) + 1 }), {})
  const emailCount = responses.filter(r => r.answers?.notify?.wants).length

  if (loading) return <div className="af-state">Loading feedback…</div>
  if (error) return <div className="af-state af-state--error">Error loading feedback: {error}</div>

  return (
    <div className="af-page">
      <div className="af-header">
        <div className="af-header__top">
          <h1 className="af-title">Chord Compass — Feedback</h1>
          <a href="/" className="af-back">← Back to tool</a>
        </div>
        <div className="af-stats">
          <div className="af-stat">
            <span className="af-stat__n">{responses.length}</span>
            <span className="af-stat__label">Total responses</span>
          </div>
          <div className="af-stat">
            <span className="af-stat__n">{emailCount}</span>
            <span className="af-stat__label">Emails collected</span>
          </div>
          <div className="af-stat">
            <span className="af-stat__n">{counts.beginner || 0}</span>
            <span className="af-stat__label">Beginners</span>
          </div>
          <div className="af-stat">
            <span className="af-stat__n">{counts.intermediate || 0}</span>
            <span className="af-stat__label">Intermediate</span>
          </div>
          <div className="af-stat">
            <span className="af-stat__n">{counts.advanced || 0}</span>
            <span className="af-stat__label">Advanced</span>
          </div>
        </div>
        <div className="af-filters">
          {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
            <button
              key={f}
              className={`af-filter ${filter === f ? 'af-filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="af-filter__count">{f === 'all' ? responses.length : counts[f] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="af-list">
        {filtered.length === 0 && <div className="af-state">No responses for this filter.</div>}
        {filtered.map(resp => {
          const { id, created_at, user_type, answers = {} } = resp
          const { notify, ...qa } = answers
          const isOpen = expanded.has(id)

          return (
            <div key={id} className={`af-card ${isOpen ? 'af-card--open' : ''}`}>
              <button className="af-card__summary" onClick={() => toggleExpand(id)}>
                <span className="af-badge" style={{ background: TYPE_COLOR[user_type] || '#666' }}>
                  {user_type}
                </span>
                <span className="af-card__date">{formatDate(created_at)}</span>
                {notify?.wants && notify.email && (
                  <span className="af-card__email-chip">✉ {notify.email}</span>
                )}
                <span className="af-card__toggle">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="af-card__body">
                  <div className="af-qa-list">
                    {Object.entries(qa).map(([key, value]) => (
                      <div key={key} className="af-qa">
                        <div className="af-qa__label">
                          {QUESTION_LABELS[key] || key}
                        </div>
                        <div className="af-qa__answer">
                          {Array.isArray(value) ? value.join(' · ') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {notify && (
                    <div className="af-notify">
                      {notify.wants ? (
                        <div className="af-notify__yes">
                          <span className="af-notify__label">Wants updates</span>
                          {notify.name && <span>{notify.name}</span>}
                          {notify.email && (
                            <a href={`mailto:${notify.email}`} className="af-notify__email">
                              {notify.email}
                            </a>
                          )}
                          {notify.role && <span className="af-notify__role">{notify.role}</span>}
                        </div>
                      ) : (
                        <span className="af-notify__no">No updates requested</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
