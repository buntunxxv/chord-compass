export const WALKTHROUGH_CONFIGS = {
  build: {
    storageKey: 'kcc_seen_intro_v2',
    steps: [
      {
        selector: '#wt-root',
        text: 'Pick a Root and Quality to build your chord.',
        action: false,
      },
      {
        selector: '#wt-play-btn',
        text: 'Play chord, in the bar at the bottom, hears whatever chord is selected right now.',
        action: true,
      },
      {
        selector: '#wt-progression',
        text: 'Your progression lives in this bar. Open it to arrange chords, set the tempo and play them back.',
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
