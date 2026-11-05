import { describe, expect, it, vi } from 'vitest'
import { toBffResponse, toBffStepResponse } from './bff-response'

const clearIntakeAccessToken = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('../server/intake-session', () => ({ clearIntakeAccessToken }))

describe('toBffResponse', () => {
  it('returns 204 without body for empty successes', async () => {
    const response = toBffResponse({ ok: true, status: 204, data: null })

    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
  })

  it('passes the api problem details through', async () => {
    const response = toBffResponse({
      ok: false,
      status: 400,
      problem: { status: 400, type: 'Intake.InvalidCode', detail: 'x' },
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      status: 400,
      type: 'Intake.InvalidCode',
      detail: 'x',
    })
  })

  it('turns a signature failure into a generic bad gateway', async () => {
    const response = toBffResponse({
      ok: false,
      status: 401,
      problem: { status: 401, detail: 'invalid signature' },
    })

    expect(response.status).toBe(502)
    expect(await response.json()).not.toHaveProperty('type')
  })
})

describe('toBffStepResponse', () => {
  it.each([
    [401, undefined],
    [403, 'Intake.TokenPhoneMismatch'],
  ])('ends the session on %s', async (status, type) => {
    clearIntakeAccessToken.mockClear()

    const response = await toBffStepResponse('abc', {
      ok: false,
      status,
      problem: { status, type },
    })

    expect(clearIntakeAccessToken).toHaveBeenCalledWith('abc')
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual(
      expect.objectContaining({ type: 'Intake.SessionExpired' }),
    )
  })

  it('passes other errors through', async () => {
    clearIntakeAccessToken.mockClear()

    const response = await toBffStepResponse('abc', {
      ok: false,
      status: 409,
      problem: { status: 409, type: 'Intake.BiometryNotAvailable' },
    })

    expect(clearIntakeAccessToken).not.toHaveBeenCalled()
    expect(response.status).toBe(409)
  })
})
