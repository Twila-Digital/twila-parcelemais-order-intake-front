const CROSS_ORIGIN_MESSAGE = 'Script error.'

const EXTENSION_PROTOCOL = /^[a-z-]+-extension:\/\//

const STACK_URL = /(?:[a-z-]+-extension|https?):\/\/[^\s)]+/g

function getOrigin(url: string) {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

export function isForeignScriptError({
  message,
  stack,
  appOrigin,
}: {
  message?: string
  stack?: string
  appOrigin: string
}) {
  if (message === CROSS_ORIGIN_MESSAGE) return true
  if (!stack) return false

  const urls = stack.match(STACK_URL)
  if (!urls) return false

  return urls.every(
    (url) => EXTENSION_PROTOCOL.test(url) || getOrigin(url) !== appOrigin,
  )
}

export function getScriptOrigins() {
  const origins = Array.from(document.scripts)
    .map((script) => script.src)
    .filter(Boolean)
    .map(getOrigin)
    .filter((origin): origin is string => origin !== null)

  return Array.from(new Set(origins))
}

export function describeThrown(thrown: unknown) {
  if (thrown === null || typeof thrown !== 'object') {
    return { type: typeof thrown }
  }

  return {
    type: thrown.constructor?.name,
    keys: Object.keys(thrown),
  }
}

const MAX_PER_FINGERPRINT = 3
const MAX_FINGERPRINTS = 200

export function createErrorThrottle({
  maxPerFingerprint = MAX_PER_FINGERPRINT,
  maxFingerprints = MAX_FINGERPRINTS,
} = {}) {
  const counts = new Map<string, number>()

  return (fingerprint = '') => {
    const seen = counts.get(fingerprint)

    if (seen === undefined) {
      if (counts.size >= maxFingerprints) return true
      counts.set(fingerprint, 1)
      return true
    }

    if (seen >= maxPerFingerprint) return false

    counts.set(fingerprint, seen + 1)
    return true
  }
}
