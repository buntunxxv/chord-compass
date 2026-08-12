import './PathToggle.css'

const OPTIONS = [
  { value: 'build', label: 'Build' },
  { value: 'learn', label: 'Learn' },
]

export default function PathToggle({ value, onChange }) {
  return (
    <div className="path-toggle" role="group" aria-label="Path">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`path-toggle__btn ${value === opt.value ? 'path-toggle__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
