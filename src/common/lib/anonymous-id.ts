export function getAnonymousId(): string {
  let anonId: string | null = null
  try {
    anonId = localStorage.getItem('anonId')
    if (!anonId) {
      anonId = crypto.randomUUID()
      localStorage.setItem('anonId', anonId)
    }
  } catch {
    anonId = crypto.randomUUID()
  }
  return anonId
}

export function getAnonymousTargetingKey(): string {
  return `anon_${getAnonymousId()}`
}
