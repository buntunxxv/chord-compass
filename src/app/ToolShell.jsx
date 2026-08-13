import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../hooks/useTheme'
import './ToolShell.css'

export default function ToolShell({ title, eyebrow, children }) {
  const { preference, resolvedTheme, setPreference } = useTheme()

  return (
    <div className="tool-shell">
      <header className="tool-shell__header">
        <div className="tool-shell__header-inner">
          <Link to="/tools" className="tool-shell__brand" aria-label="Kynda Tools home">
            <img
              src={resolvedTheme === 'dark' ? '/kynda-logo-white.png' : '/kynda-logo-full.png'}
              alt="Kynda Learning"
            />
            <span className="tool-shell__brand-divider" aria-hidden="true" />
            <span className="tool-shell__brand-name">Tools</span>
          </Link>
          <ThemeToggle preference={preference} onChange={setPreference} />
        </div>
      </header>

      <main className="tool-shell__main">
        {title && (
          <div className="tool-shell__intro">
            {eyebrow && <p className="tool-shell__eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
