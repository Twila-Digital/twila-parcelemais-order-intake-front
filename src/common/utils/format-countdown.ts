const SECONDS_IN_MINUTE = 60

export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE)
  const seconds = totalSeconds % SECONDS_IN_MINUTE
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
