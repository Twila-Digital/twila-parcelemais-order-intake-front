import 'server-only'
import type { NextRequest } from 'next/server'

const MAX_BODY_SIZE_IN_BYTES = 16 * 1024

export async function readJsonBody(req: NextRequest) {
  const text = await req.text().catch(() => '')
  if (!text || text.length > MAX_BODY_SIZE_IN_BYTES) return null

  try {
    const body = JSON.parse(text) as unknown
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}
