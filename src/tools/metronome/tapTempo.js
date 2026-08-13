export function calculateTapBpm(timestamps) {
  if (timestamps.length < 2) return null

  const intervals = timestamps.slice(1).map((tap, index) => tap - timestamps[index])
  if (intervals.some(interval => interval <= 0)) return null

  const average = intervals.reduce((total, interval) => total + interval, 0) / intervals.length
  return Math.round(60000 / average)
}
