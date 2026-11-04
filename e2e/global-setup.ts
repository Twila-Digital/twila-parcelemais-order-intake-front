const ROUTES = ['/']
const MAX_ATTEMPTS = 10
const RETRY_DELAY_MS = 2_000

async function warmUp(baseUrl: string, route: string) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${baseUrl}${route}`)
      if (response.ok) {
        await response.text()
        return
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
  }
}

export default async function globalSetup() {
  const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

  for (const route of ROUTES) {
    await warmUp(baseUrl, route)
  }
}
