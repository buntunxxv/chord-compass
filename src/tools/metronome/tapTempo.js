export function calculateTapBpm(timestamps) {
  if (timestamps.length < 2) return null

  const intervals = timestamps.slice(1).map((tap, index) => tap - timestamps[index])
  if (intervals.some(interval => interval <= 0)) return null

  const average = intervals.reduce((total, interval) => total + interval, 0) / intervals.length
  return Math.round(60000 / average)
}

export function assessPulseTiming(timestamps, bpm) {
  if (timestamps.length < 4 || !Number.isFinite(bpm) || bpm <= 0) return null

  const intervals = timestamps.slice(1).map((tap, index) => tap - timestamps[index])
  if (intervals.some(interval => interval <= 0)) return null

  const targetInterval = 60000 / bpm
  const averageErrorMs = Math.round(
    intervals.reduce((total, interval) => total + Math.abs(interval - targetInterval), 0) / intervals.length,
  )

  return {
    averageErrorMs,
    rating: averageErrorMs <= 70 ? 'steady' : averageErrorMs <= 140 ? 'close' : 'drifting',
  }
}
