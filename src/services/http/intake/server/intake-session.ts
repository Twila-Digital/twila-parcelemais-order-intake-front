import 'server-only'
import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_PREFIX = 'intake_session_'
const TOKEN_HASH_LENGTH = 16

export function getIntakeSessionCookieName(token: string) {
  const hash = createHash('sha256')
    .update(token)
    .digest('hex')
    .slice(0, TOKEN_HASH_LENGTH)
  return `${COOKIE_PREFIX}${hash}`
}

export async function getIntakeAccessToken(token: string) {
  const cookieStore = await cookies()
  return cookieStore.get(getIntakeSessionCookieName(token))?.value ?? null
}

export async function setIntakeAccessToken(
  token: string,
  accessToken: string,
  expiresInSeconds: number,
) {
  const cookieStore = await cookies()
  cookieStore.set(getIntakeSessionCookieName(token), accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds,
  })
}

export async function clearIntakeAccessToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.delete(getIntakeSessionCookieName(token))
}
