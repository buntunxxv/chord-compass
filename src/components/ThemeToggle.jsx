import './ThemeToggle.css'

const OPTIONS = [
  { value: 'light', icon: '☀️', label: 'Light' },
  { value: 'dark', icon: '🌙', label: 'Dark' },
  { value: 'system', icon: '🖥️', label: 'Match system settings' },
]

export default function ThemeToggle({ preference, onChange }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`theme-toggle__btn ${preference === opt.value ? 'theme-toggle__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={preference === opt.value}
          aria-label={opt.label}
          title={opt.label}
        >
          <span className="theme-toggle__icon">{opt.icon}</span>
        </button>
      ))}
    </div>
  )
}
