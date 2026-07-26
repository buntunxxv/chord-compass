import { useState, useRef, useEffect } from 'react'
import './Dropdown.css'

export default function Dropdown({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div className="dropdown" ref={rootRef} id={id}>
      <span className="dropdown__label">{label}</span>
      <button
        type="button"
        className={`dropdown__trigger ${open ? 'dropdown__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="dropdown__value">{selected ? selected.label : ''}</span>
        <svg className="dropdown__chevron" width="11" height="7" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul className="dropdown__panel" role="listbox" aria-label={label}>
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`dropdown__option ${opt.value === value ? 'dropdown__option--selected' : ''} ${opt.disabled ? 'dropdown__option--disabled' : ''}`}
              onClick={() => {
                if (opt.disabled) return
                onChange(opt.value)
                setOpen(false)
              }}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <svg className="dropdown__check" width="13" height="10" viewBox="0 0 14 10" aria-hidden="true">
                  <path d="M1 5l4 4 8-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
