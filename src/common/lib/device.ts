const MOBILE_USER_AGENT = /Mobi|iPhone|iPod/i

export function isMobileUserAgent(userAgent: string | null) {
  return !userAgent || MOBILE_USER_AGENT.test(userAgent)
}
