import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { getIntakeStepData } from './get-intake-step-data'

const intakeServerFetch = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  cache: <T>(fn: T) => fn,
}))
vi.mock('@/common/lib/datadog-server-logger', () => ({ logError: vi.fn() }))
vi.mock('./intake-server-fetch', () => ({ intakeServerFetch }))
vi.mock('./intake-session', () => ({
  getIntakeAccessToken: async () => 'jwt',
}))

describe('getIntakeStepData', () => {
  beforeEach(() => {
    intakeServerFetch.mockReset()
  })

  it('loads the biometry session with the access token', async () => {
    const biometry = {
      isCompleted: false,
      transactionStatus: null,
      sessionUrl: 'https://biometria.example/session',
    }
    intakeServerFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: biometry,
    })

    expect(await getIntakeStepData('abc', IntakeStepStatus.Biometry)).toEqual({
      ...biometry,
      isAvailable: true,
    })
    expect(intakeServerFetch).toHaveBeenCalledWith('abc', 'intake/biometry', {
      accessToken: 'jwt',
    })
  })

  it('flags the biometry as not available yet', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 409,
      problem: { status: 409, type: 'Intake.BiometryNotAvailable' },
    })

    expect(await getIntakeStepData('abc', IntakeStepStatus.Biometry)).toEqual(
      expect.objectContaining({ isAvailable: false, sessionUrl: null }),
    )
  })

  it('returns null when the biometry fails', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 400,
      problem: { status: 400, type: 'Intake.BiometryUnexpectedError' },
    })

    expect(await getIntakeStepData('abc', IntakeStepStatus.Biometry)).toBeNull()
  })
})
