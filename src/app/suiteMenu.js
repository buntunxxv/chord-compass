import { TOOLS } from './tools'

// The single list behind every "hamburger" menu across the suite (Chord
// Compass's own header and ToolShell, which the 3 companion tools share) --
// one source means the menus can no longer drift apart the way Chord
// Compass's hand-rolled copy once did.
export const SUITE_MENU_ITEMS = [
  { key: 'all-tools', label: 'All tools', to: '/tools' },
  ...TOOLS.map(tool => ({ key: tool.path, label: tool.name, to: tool.path })),
  { key: 'portal', label: 'Portal', href: 'https://www.kyndalearning.co.uk/portal' },
]
