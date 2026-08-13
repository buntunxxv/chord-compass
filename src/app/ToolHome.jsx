import { Link } from 'react-router-dom'
import ToolShell from './ToolShell'
import './ToolHome.css'

const TOOLS = [
  {
    name: 'Chord Compass',
    description: 'Build chord progressions and understand why each movement works.',
    path: '/',
    label: 'Open tool',
    icon: '⌁',
  },
  {
    name: 'Metronome',
    description: 'Set a pulse, choose a time signature, or find a tempo by tapping.',
    path: '/metronome',
    label: 'Open tool',
    icon: '♩',
  },
  {
    name: 'Interval Ear Trainer',
    description: 'Learn to recognise the distance between two notes by ear.',
    path: '/ear-trainer',
    label: 'Open tool',
    icon: '◒',
  },
  {
    name: 'Chord–Scale Explorer',
    description: 'Find scales for a chord—or chords that belong to a scale.',
    path: '/chord-scales',
    label: 'Open tool',
    icon: '◎',
  },
]

export default function ToolHome() {
  return (
    <ToolShell title="Small tools for making more sense of music" eyebrow="Kynda Learning">
      <p className="tool-home__lede">
        Practical, browser-based helpers for writing, practising and learning. Start anywhere—no setup required.
      </p>

      <div className="tool-home__grid">
        {TOOLS.map(tool => {
          const content = (
            <>
              <span className="tool-home__icon" aria-hidden="true">{tool.icon}</span>
              <div>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
              </div>
              <span className={`tool-home__label ${tool.path ? '' : 'tool-home__label--muted'}`}>
                {tool.label}{tool.path && ' →'}
              </span>
            </>
          )

          return tool.path ? (
            <Link key={tool.name} to={tool.path} className="tool-home__card">
              {content}
            </Link>
          ) : (
            <article key={tool.name} className="tool-home__card tool-home__card--planned">
              {content}
            </article>
          )
        })}
      </div>
    </ToolShell>
  )
}
