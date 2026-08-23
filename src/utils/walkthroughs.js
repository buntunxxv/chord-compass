export const WALKTHROUGH_CONFIGS = {
  build: {
    // v3: the workspace changed shape underneath anyone who had already seen
    // v2 -- Identify and Templates went from overlays stacked on Build to
    // slides beside it -- so the tour is worth showing once more rather than
    // leaving existing users to discover the new navigation themselves.
    storageKey: 'kcc_seen_intro_v3',
    steps: [
      {
        // The nav first: it is the only step that explains there is more than
        // one page, and nothing else on screen reveals that Identify and
        // Templates exist.
        selector: '#wt-workspace-nav',
        text: 'Build, Identify and Templates are three ways to find a chord. Tap a tab, or swipe sideways to move between them.',
        action: false,
      },
      {
        selector: '#wt-root',
        text: 'Tap Root or Quality to choose from a list, and your chord takes shape as you go.',
        action: false,
      },
      {
        selector: '#wt-play-btn',
        text: 'Play chord, in the bar at the bottom, hears whatever chord is selected right now.',
        action: true,
      },
      {
        // Action-gated on the tab itself, so tapping it actually moves you to
        // Identify -- the next step's target lives on that slide, and the
        // spotlight follows the track as it scrolls.
        selector: '#wt-tab-find',
        text: 'Know the notes but not the chord? Identify works the other way round. Tap it to try.',
        action: true,
      },
      {
        selector: '#wt-note-picker',
        text: 'Tap the notes you want. The shapes that contain them come up in a sheet you can flick through.',
        action: false,
      },
      {
        selector: '#wt-progression',
        text: 'Whichever way you find a chord, your progression lives in this bar. Open it to arrange chords, set the tempo and play them back.',
        action: false,
      },
    ],
  },
  learn: {
    storageKey: 'kcc_seen_learn_intro',
    steps: [
      {
        selector: '#wt-learn-key-picker',
        actionSelector: '#wt-learn-key-picker button',
        text: 'Pick the key you want to practise in.',
        action: true,
      },
      {
        selector: '#wt-learn-challenge-list',
        actionSelector: '#wt-learn-challenge-list .learn-path__start-btn',
        text: 'Pick any challenge to begin.',
        action: true,
      },
      {
        selector: '#wt-learn-step-picker',
        actionSelector: '#wt-learn-step-picker button',
        text: 'Predict the next chord before it plays, then choose it. You’ll hear your pick before the answer is revealed.',
        action: true,
      },
    ],
  },
}

export function walkthroughFlowForPath(path) {
  return path === 'learn' ? 'learn' : 'build'
}

export function shouldAutoOpenWalkthrough(path, storage) {
  const flow = walkthroughFlowForPath(path)
  return !storage.getItem(WALKTHROUGH_CONFIGS[flow].storageKey)
}
