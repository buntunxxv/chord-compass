import { Link, useLocation } from 'react-router-dom'
import { SUITE_MENU_ITEMS } from './suiteMenu'

// Renders the shared suite menu items (see suiteMenu.js) as a flat list of
// link elements, styled by the caller's own className so Chord Compass's
// header and ToolShell's mobile menu can keep their existing look while
// drawing from the one shared list. The item matching the current route
// renders as inert, marked text instead of a link to itself -- a tap that
// would silently do nothing is worse than no link at all.
export default function SuiteMenuLinks({ className, currentClassName, onNavigate }) {
  const { pathname } = useLocation()

  return SUITE_MENU_ITEMS.map(item => {
    if (item.href) {
      return (
        <a key={item.key} href={item.href} className={className} onClick={onNavigate}>
          {item.label}
        </a>
      )
    }

    if (item.to === pathname) {
      return (
        <span key={item.key} className={`${className} ${currentClassName}`} aria-current="page">
          {item.label} <span aria-hidden="true">(this page)</span>
        </span>
      )
    }

    return (
      <Link key={item.key} to={item.to} className={className} onClick={onNavigate}>
        {item.label}
      </Link>
    )
  })
}
