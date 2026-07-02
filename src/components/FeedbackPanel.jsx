import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import './FeedbackPanel.css'

// ─── Question data ───────────────────────────────────────────────────────────

const USER_TYPES = [
  {
    value: 'beginner',
    label: 'Beginner / Student',
    description: 'I know some chords and I\'m building confidence.',
  },
  {
    value: 'intermediate',
    label: 'Intermediate Creator',
    description: 'I write music, make beats, or develop song ideas.',
  },
  {
    value: 'advanced',
    label: 'Advanced Musician',
    description: 'I\'m an experienced player, producer, teacher, or professional.',
  },
]

const QUESTIONS = {
  beginner: [
    {
      id: 'b1',
      type: 'choice',
      question: 'What did you think this tool was helping you do?',
      options: [
        'Find out what notes are in a chord',
        'Learn how chords sound',
        'Choose what chord could come next',
        'Help write a song',
        "I wasn't sure",
      ],
    },
    {
      id: 'b2',
      type: 'choice',
      question: 'Was it clear how to choose a chord using Root, Quality and Extension?',
      options: ['Yes, clear', 'Mostly clear', 'A bit confusing', 'I did not understand it'],
    },
    {
      id: 'b3',
      type: 'choice',
      question: 'Did hearing the chord make the notes/intervals easier to understand?',
      options: ['Yes', 'A little', 'Not really', 'I did not use the sound'],
    },
    {
      id: 'b4',
      type: 'choice',
      question: 'The tool showed next-chord ideas like "Familiar", "Opens out" and "Moves forward". Did those labels make sense?',
      options: ['Yes, they helped', 'Some made sense', 'The labels were too vague', 'I did not understand them'],
    },
    {
      id: 'b5',
      type: 'choice',
      question: 'Did any suggested next chord make you want to try building a progression?',
      options: ['Yes', 'Maybe', 'Not yet', 'I did not understand the suggestions'],
    },
    {
      id: 'b6',
      type: 'text',
      question: 'What confused you most?',
      placeholder: 'Anything that felt unclear or unexpected…',
    },
    {
      id: 'b7',
      type: 'text',
      question: 'What would make this more useful for learning chords?',
      placeholder: "Be honest — what's the missing piece?",
    },
  ],
  intermediate: [
    {
      id: 'i1',
      type: 'choice',
      question: 'Could this help you get unstuck when writing a chord progression?',
      options: ['Yes', 'Possibly, with more options', 'Not in its current form', 'No'],
    },
    {
      id: 'i2',
      type: 'choice',
      question: 'Did the playback help you judge the chord movement?',
      options: ['Yes', 'A little', 'Not really', 'I did not use playback'],
    },
    {
      id: 'i3',
      type: 'choice',
      question: 'Did any of the suggested next chords feel like something you might actually try in a song or beat?',
      options: ['Yes', 'Maybe', 'Not yet', 'The suggestions felt too basic'],
    },
    {
      id: 'i4',
      type: 'choice',
      question: 'Were the direction labels useful?',
      options: [
        'Yes, they helped me understand the feel',
        'Some were useful',
        'They need better wording',
        'They did not help',
      ],
    },
    {
      id: 'i5',
      type: 'multiselect',
      question: 'What would make this more useful for your music-making?',
      options: [
        'More chord types',
        'Better piano/guitar/bass voicings',
        'Genre-based suggestions',
        'Progression playback',
        'Save/export ideas',
        'Stronger explanations',
        'Other',
      ],
      hint: 'Select all that apply',
    },
    {
      id: 'i6',
      type: 'choice',
      question: 'When you saw the locked "Pro" directions, what did you expect would be behind it?',
      options: [
        'More chord suggestions',
        'More advanced harmony',
        'Genre-based ideas',
        'Better playback',
        'Full progressions',
        "I wasn't sure",
      ],
    },
    {
      id: 'i7',
      type: 'text',
      question: 'Which genres or styles should this tool understand better?',
      placeholder: 'R&B, jazz, film, drill, gospel — whatever applies to you…',
    },
    {
      id: 'i8',
      type: 'text',
      question: 'What feature would need to exist before this felt worth paying for?',
      placeholder: "Think about what you'd actually pay for…",
    },
  ],
  advanced: [
    {
      id: 'a1',
      type: 'choice',
      question: 'Does the concept make sense as a songwriting education tool?',
      options: ['Yes', 'Yes, but it needs deeper musical logic', 'Not yet', 'No'],
    },
    {
      id: 'a2',
      type: 'choice',
      question: 'Are the current direction labels musically believable?',
      options: ['Yes', 'Some are', 'They are too vague', 'They need a different system'],
    },
    {
      id: 'a3',
      type: 'choice',
      question: 'Do any of the suggested chord movements feel misleading or too basic?',
      options: [
        'No, fine for Phase 1',
        'Some are too basic',
        'Some need better explanation',
        'Yes, the logic needs work',
      ],
    },
    {
      id: 'a4',
      type: 'multiselect',
      question: 'What would make this useful for a more advanced player?',
      options: [
        'Better voicings',
        'Voice-leading',
        'Inversions/slash chords',
        'Modal interchange',
        'Secondary dominants',
        'Genre-specific harmony',
        'Reharmonisation ideas',
        'Other',
      ],
      hint: 'Select all that apply',
    },
    {
      id: 'a5',
      type: 'choice',
      question: 'When you saw the locked "Pro" directions, what did you expect would be behind it?',
      options: [
        'More chord suggestions',
        'More advanced harmony',
        'Genre-based ideas',
        'Better playback',
        'Full progressions',
        "I wasn't sure",
      ],
    },
    {
      id: 'a6',
      type: 'text',
      question: 'What should this tool avoid becoming?',
      placeholder: 'What would undermine its credibility?',
    },
    {
      id: 'a7',
      type: 'text',
      question: 'Where is the strongest potential in this idea?',
      placeholder: 'Think about the right version of this…',
    },
    {
      id: 'a8',
      type: 'text',
      question: 'What is the one musical improvement you would make first?',
      placeholder: 'Be specific…',
    },
  ],
}

const FINAL_QUESTION = {
  id: 'notify',
  type: 'notify',
  question: 'Would you like to hear when the next version is ready?',
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

// ─── Notify question component ────────────────────────────────────────────────

function NotifyQuestion({ answer, onChange }) {
  const wantsNotify = answer?.wants === true
  const declinedNotify = answer?.wants === false
  return (
    <div className="fp-notify">
      <div className="fp-choice">
        {[
          { label: "Yes, I'll leave my email", yes: true },
          { label: 'No thanks', yes: false },
        ].map(({ label, yes }) => (
          <button
            key={label}
            className={`fp-choice__option ${(yes ? wantsNotify : declinedNotify) ? 'fp-choice__option--active' : ''}`}
            onClick={() => onChange(yes ? { wants: true } : { wants: false })}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      {wantsNotify && (
        <div className="fp-notify__fields">
          <input
            className="fp-input"
            type="text"
            placeholder="Name"
            value={answer?.name || ''}
            onChange={e => onChange({ ...answer, name: e.target.value })}
          />
          <input
            className="fp-input"
            type="email"
            placeholder="Email"
            value={answer?.email || ''}
            onChange={e => onChange({ ...answer, email: e.target.value })}
          />
          <input
            className="fp-input"
            type="text"
            placeholder="Instrument or role"
            value={answer?.role || ''}
            onChange={e => onChange({ ...answer, role: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function FeedbackPanel({ isOpen, onClose, theme }) {
  const [stage, setStage] = useState('type') // 'type' | 'questions' | 'final' | 'done'
  const [userType, setUserType] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState(1)
  const [animating, setAnimating] = useState(false)
  const textareaRef = useRef(null)

  const questions = userType ? QUESTIONS[userType] : []
  const isFinal = stage === 'final'
  const currentQ = isFinal ? FINAL_QUESTION : questions[questionIndex]
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined

  const totalSteps = questions.length + 1 // +1 for the notify question
  const currentStep = stage === 'questions' ? questionIndex + 1 : stage === 'final' ? totalSteps : 0
  const progress = (stage === 'questions' || stage === 'final') ? currentStep / totalSteps : 0

  useEffect(() => {
    if (currentQ?.type === 'text' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 320)
    }
  }, [questionIndex, stage, currentQ])

  function setAnswer(value) {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  function canAdvance() {
    if (stage === 'type') return !!userType
    if (!currentQ) return false
    if (currentQ.type === 'text') return true
    if (currentQ.type === 'multiselect') return true
    if (currentQ.type === 'notify') return true
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
          setStage('final')
        } else {
          setQuestionIndex(i => i + step)
        }
      } else if (stage === 'final') {
        if (step === -1) {
          setStage('questions')
          setQuestionIndex(questions.length - 1)
        } else if (step === 1) {
          submitFeedback()
          setStage('done')
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

  function startOver() {
    setStage('type')
    setUserType(null)
    setQuestionIndex(0)
    setAnswers({})
  }

  return (
    <>
      <div
        className={`fp-backdrop ${isOpen ? 'fp-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fp-panel ${isOpen ? 'fp-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Feedback questionnaire"
      >
        {/* Header */}
        <div className="fp-header">
          <div className="fp-header__brand">
            <img src={theme === 'dark' ? '/kynda-logo-white.png' : '/kynda-logo-full.png'} alt="Kynda Learning" className="fp-header__logo" />
          </div>
          <div className="fp-header__actions">
            {(stage === 'questions' || stage === 'type' || stage === 'final') && (
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
        {(stage === 'questions' || stage === 'final') && (
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
              <p className="fp-screen__sub">
                This is an early prototype. I'm testing whether the chord choices, sound playback and "where could this chord go?" ideas are useful enough to develop further.
              </p>
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

          {/* Stage: questions or final notify */}
          {(stage === 'questions' || stage === 'final') && currentQ && (
            <div className="fp-screen">
              <div className="fp-screen__eyebrow">
                {currentStep} of {totalSteps}
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
                {currentQ.type === 'choice' && (
                  <ChoiceInput
                    value={currentAnswer}
                    onChange={v => { setAnswer(v); setTimeout(() => navigate(1), 320) }}
                    options={currentQ.options}
                  />
                )}
                {currentQ.type === 'multiselect' && (
                  <MultiSelect
                    value={currentAnswer || []}
                    onChange={setAnswer}
                    options={currentQ.options}
                  />
                )}
                {currentQ.type === 'notify' && (
                  <NotifyQuestion
                    answer={currentAnswer}
                    onChange={setAnswer}
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
              <button className="fp-btn fp-btn--primary" onClick={() => { onClose(); startOver() }}>
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
            {(stage === 'questions' || stage === 'final') && (
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
                : stage === 'final'
                ? 'Submit'
                : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
