import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import './FeedbackPanel.css'

// ─── Question data ───────────────────────────────────────────────────────────

const USER_TYPES = [
  {
    value: 'beginner',
    label: 'Beginner / Student',
    description: 'Know some chords, building confidence',
  },
  {
    value: 'intermediate',
    label: 'Intermediate Creator',
    description: 'Writing music, developing your sound',
  },
  {
    value: 'advanced',
    label: 'Advanced Musician',
    description: 'Experienced player or professional',
  },
]

const DIRECTION_LABELS = ['Familiar', 'Opens out', 'Moves forward', 'Tension', 'Darker', 'Lift', 'Surprise', 'Resolution']

const QUESTIONS = {
  beginner: [
    { id: 'b1', type: 'text', question: 'What did you think this tool was helping you do?', placeholder: 'Describe it in your own words…' },
    { id: 'b2', type: 'scale', question: 'Was it clear how to choose a chord?', low: 'Very confusing', high: 'Very clear' },
    { id: 'b3', type: 'scale', question: 'Did hearing the chord make music theory feel easier to understand?', low: 'Not at all', high: 'A lot easier' },
    { id: 'b4', type: 'scale', question: 'Did the suggested next chords give you musical ideas?', low: 'Not really', high: 'Yes, definitely' },
    { id: 'b5', type: 'multiselect', question: 'Which direction labels made sense to you?', options: DIRECTION_LABELS, hint: 'Select all that apply' },
    { id: 'b6', type: 'multiselect', question: 'Which direction labels confused you?', options: DIRECTION_LABELS, hint: 'Select all that apply — none is fine' },
    { id: 'b7', type: 'scale', question: 'Could you imagine using this while writing a song or beat?', low: 'Not really', high: 'Absolutely' },
    { id: 'b8', type: 'text', question: 'What would you want the tool to show you next?', placeholder: 'Anything you felt was missing…' },
    { id: 'b9', type: 'text', question: 'What would make you come back to it?', placeholder: 'Be honest — what\'s the missing piece?' },
    { id: 'b10', type: 'scale', question: 'Would this help you learn chords better than a normal chord chart?', low: 'No, not really', high: 'Yes, much better' },
  ],
  intermediate: [
    { id: 'i1', type: 'scale', question: 'Would this help you get unstuck when writing chords?', low: 'Probably not', high: 'Yes, definitely' },
    { id: 'i2', type: 'scale', question: 'Did any suggested next chord feel like something you\'d actually try?', low: 'None of them', high: 'Several did' },
    { id: 'i3', type: 'scale', question: 'Did the direction labels help you understand the emotional effect of a chord move?', low: 'Not really', high: 'Yes, clearly' },
    { id: 'i4', type: 'text', question: 'What felt missing from the current version?', placeholder: 'What would you expect to see that isn\'t here?' },
    { id: 'i5', type: 'multiselect', question: 'Which genre modes would make this more useful for your work?', options: ['R&B', 'Pop', 'Drill', 'Gospel', 'Afrobeats', 'Soul', 'Film / Score', 'Jazz', 'Electronic', 'Rock'], hint: 'Select all that apply' },
    { id: 'i6', type: 'choice', question: 'What would improve the tool most for you right now?', options: ['More chord options', 'Better voicings', 'Stronger explanations', 'All three equally'] },
    { id: 'i7', type: 'scale', question: 'Would saving a progression matter to you?', low: 'Not really', high: 'Very much' },
    { id: 'i8', type: 'scale', question: 'Would hearing playback at different tempos help you test ideas?', low: 'Not much', high: 'A lot' },
    { id: 'i9', type: 'text', question: 'What would make this useful enough to return to?', placeholder: 'What\'s the one thing that would bring you back?' },
    { id: 'i10', type: 'text', question: 'What feature would make a paid version worth considering?', placeholder: 'Think about what you\'d actually pay for…' },
  ],
  advanced: [
    { id: 'a1', type: 'scale', question: 'Does the core concept make sense as a songwriting education tool?', low: 'Not really', high: 'Definitely yes' },
    { id: 'a2', type: 'scale', question: 'Are the chord direction labels musically believable?', low: 'No, too vague', high: 'Yes, accurate' },
    { id: 'a3', type: 'text', question: 'Which labels feel too vague, inaccurate, or amateur?', placeholder: 'Name any that don\'t sit right musically…' },
    { id: 'a4', type: 'text', question: 'Are any of the suggested chord movements misleading?', placeholder: 'Point to anything that feels wrong or off…' },
    { id: 'a5', type: 'text', question: 'What would make this useful for a more advanced player?', placeholder: 'Think depth, not just more chords…' },
    { id: 'a6', type: 'scale', question: 'Would richer voicings change your opinion of the tool?', low: 'Not much', high: 'Significantly' },
    { id: 'a7', type: 'scale', question: 'Would instrument-specific voicings matter more than more chord theory?', low: 'Theory first', high: 'Voicings first' },
    { id: 'a8', type: 'text', question: 'What genres or musical situations should the tool handle carefully?', placeholder: 'Where could lazy assumptions cause problems?' },
    { id: 'a9', type: 'text', question: 'Where could this tool become genuinely valuable — even if it isn\'t there yet?', placeholder: 'Think about the right version of this idea…' },
    { id: 'a10', type: 'text', question: 'What should I avoid building — because it would make the tool feel gimmicky?', placeholder: 'What would undermine the credibility?' },
  ],
}

// ─── Scale component ──────────────────────────────────────────────────────────

function ScaleInput({ value, onChange, low, high }) {
  return (
    <div className="fp-scale">
      <div className="fp-scale__labels">
        <span>{low}</span>
        <span>{high}</span>
      </div>
      <div className="fp-scale__pips">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            className={`fp-scale__pip ${value === n ? 'fp-scale__pip--active' : ''}`}
            onClick={() => onChange(n)}
            type="button"
            aria-label={`${n} of 5`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Multiselect component ────────────────────────────────────────────────────

function MultiSelect({ value = [], onChange, options }) {
  function toggle(opt) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }
  return (
    <div className="fp-multiselect">
      {options.map(opt => (
        <button
          key={opt}
          className={`fp-multiselect__pill ${value.includes(opt) ? 'fp-multiselect__pill--active' : ''}`}
          onClick={() => toggle(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Choice component ─────────────────────────────────────────────────────────

function ChoiceInput({ value, onChange, options }) {
  return (
    <div className="fp-choice">
      {options.map(opt => (
        <button
          key={opt}
          className={`fp-choice__option ${value === opt ? 'fp-choice__option--active' : ''}`}
          onClick={() => onChange(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function FeedbackPanel({ isOpen, onClose }) {
  const [stage, setStage] = useState('type') // 'type' | 'questions' | 'done'
  const [userType, setUserType] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [animating, setAnimating] = useState(false)
  const textareaRef = useRef(null)

  const questions = userType ? QUESTIONS[userType] : []
  const currentQ = questions[questionIndex]
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined
  const progress = stage === 'questions' ? (questionIndex + 1) / questions.length : 0

  // Auto-focus textarea when question changes
  useEffect(() => {
    if (currentQ?.type === 'text' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 320)
    }
  }, [questionIndex, currentQ])

  function setAnswer(value) {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  function canAdvance() {
    if (stage === 'type') return !!userType
    if (!currentQ) return false
    if (currentQ.type === 'text') return true // text is optional
    if (currentQ.type === 'multiselect') return true // multiselect optional
    return currentAnswer !== undefined
  }

  function navigate(step) {
    if (animating) return
    setDirection(step)
    setAnimating(true)
    setTimeout(() => {
      if (stage === 'type' && step === 1) {
        setStage('questions')
        setQuestionIndex(0)
      } else if (stage === 'questions') {
        if (step === -1 && questionIndex === 0) {
          setStage('type')
        } else if (step === 1 && questionIndex === questions.length - 1) {
          submitFeedback()
          setStage('done')
        } else {
          setQuestionIndex(i => i + step)
        }
      }
      setAnimating(false)
    }, 260)
  }

  async function submitFeedback() {
    try {
      await supabase.from('chord_compass_feedback').insert({
        user_type: userType,
        answers,
      })
    } catch (err) {
      console.error('[Chord Compass Feedback] submit failed', err)
    }
  }

  function resetAndClose() {
    onClose()
  }

  function startOver() {
    setStage('type')
    setUserType(null)
    setQuestionIndex(0)
    setAnswers({})
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fp-backdrop ${isOpen ? 'fp-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fp-panel ${isOpen ? 'fp-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Feedback questionnaire"
      >
        {/* Header */}
        <div className="fp-header">
          <div className="fp-header__brand">
            <img src="/kynda-logo-full.png" alt="Kynda Learning" className="fp-header__logo" />
          </div>
          <div className="fp-header__actions">
            {(stage === 'questions' || stage === 'type') && (
              <button
                className="fp-header__restart"
                onClick={startOver}
                aria-label="Start over"
                title="Clear all answers and start again"
              >
                ↺ Start over
              </button>
            )}
            <button className="fp-header__close" onClick={onClose} aria-label="Close feedback and return to tool">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Back to tool</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {stage === 'questions' && (
          <div className="fp-progress">
            <div className="fp-progress__bar" style={{ width: `${progress * 100}%` }} />
          </div>
        )}

        {/* Content */}
        <div className={`fp-content fp-content--${animating ? (direction > 0 ? 'exit-left' : 'exit-right') : 'visible'}`}>

          {/* Stage: user type selection */}
          {stage === 'type' && (
            <div className="fp-screen">
              <div className="fp-screen__eyebrow">Early feedback</div>
              <h2 className="fp-screen__heading">Which best describes you?</h2>
              <p className="fp-screen__sub">We'll ask you the right questions for your level.</p>
              <div className="fp-typecards">
                {USER_TYPES.map(t => (
                  <button
                    key={t.value}
                    className={`fp-typecard ${userType === t.value ? 'fp-typecard--active' : ''}`}
                    onClick={() => {
                      setUserType(t.value)
                      setTimeout(() => {
                        setStage('questions')
                        setQuestionIndex(0)
                      }, 320)
                    }}
                    type="button"
                  >
                    <span className="fp-typecard__label">{t.label}</span>
                    <span className="fp-typecard__desc">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stage: questions */}
          {stage === 'questions' && currentQ && (
            <div className="fp-screen">
              <div className="fp-screen__eyebrow">
                {questionIndex + 1} of {questions.length}
              </div>
              <h2 className="fp-screen__heading">{currentQ.question}</h2>
              {currentQ.hint && <p className="fp-screen__sub">{currentQ.hint}</p>}

              <div className="fp-answer">
                {currentQ.type === 'text' && (
                  <textarea
                    ref={textareaRef}
                    className="fp-textarea"
                    placeholder={currentQ.placeholder}
                    value={currentAnswer || ''}
                    onChange={e => setAnswer(e.target.value)}
                    rows={4}
                  />
                )}
                {currentQ.type === 'scale' && (
                  <ScaleInput
                    value={currentAnswer}
                    onChange={v => { setAnswer(v); setTimeout(() => navigate(1), 320) }}
                    low={currentQ.low}
                    high={currentQ.high}
                  />
                )}
                {currentQ.type === 'multiselect' && (
                  <MultiSelect
                    value={currentAnswer || []}
                    onChange={setAnswer}
                    options={currentQ.options}
                  />
                )}
                {currentQ.type === 'choice' && (
                  <ChoiceInput
                    value={currentAnswer}
                    onChange={v => { setAnswer(v); setTimeout(() => navigate(1), 320) }}
                    options={currentQ.options}
                  />
                )}
              </div>
            </div>
          )}

          {/* Stage: done */}
          {stage === 'done' && (
            <div className="fp-screen fp-screen--center">
              <div className="fp-done__icon">✓</div>
              <h2 className="fp-screen__heading">Thank you.</h2>
              <p className="fp-screen__sub">
                This feedback genuinely shapes what gets built next. We appreciate you taking the time.
              </p>
              <button className="fp-btn fp-btn--primary" onClick={resetAndClose}>
                Back to Chord Compass
              </button>
              <button className="fp-btn fp-btn--ghost" onClick={startOver}>
                Submit another response
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {stage !== 'done' && (
          <div className="fp-footer">
            {(stage === 'questions') && (
              <button className="fp-btn fp-btn--ghost" onClick={() => navigate(-1)} type="button">
                ← Back
              </button>
            )}
            {stage === 'type' && <div />}
            <button
              className="fp-btn fp-btn--primary"
              onClick={() => navigate(1)}
              disabled={!canAdvance()}
              type="button"
            >
              {stage === 'type'
                ? 'Start →'
                : questionIndex === questions.length - 1
                ? 'Submit'
                : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
