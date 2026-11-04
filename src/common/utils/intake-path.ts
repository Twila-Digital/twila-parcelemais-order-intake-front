export function getIntakeEntryPath(token: string) {
  return `/intake/${encodeURIComponent(token)}`
}

export function getIntakeStepPath(token: string, route: string) {
  return `${getIntakeEntryPath(token)}/${route}`
}
