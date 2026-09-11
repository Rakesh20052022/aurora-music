// Format seconds as m:ss (or h:mm:ss for long tracks).
export function formatDuration(totalSeconds) {
  const s = Math.floor(totalSeconds || 0)
  if (!s) return "0:00"
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n) => String(n).padStart(2, "0")
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

export function formatCount(n) {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function artistName(song) {
  return song?.artist?.name || "Unknown Artist"
}
