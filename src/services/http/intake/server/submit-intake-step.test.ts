import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { submitIntakeStep } from './submit-intake-step'

const intakeServerFetch = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('./intake-server-fetch', () => ({ intakeServerFetch }))

const RESPONSE = { ok: true, status: 200, data: null }

describe('submitIntakeStep', () => {
  beforeEach(() => {
    intakeServerFetch.mockReset().mockResolvedValue(RESPONSE)
  })

  it('completes the profile with the birth date in Brasília time', async () => {
    const result = await submitIntakeStep(
      'abc',
      IntakeStepStatus.UpdateProfile,
      {
        name: ' Maria Silva ',
        email: 'maria@example.com',
        dateOfBirth: '1990-05-20',
        password: 'Senha@123',
      },
      'jwt',
    )

    expect(result).toEqual({ ok: true, response: RESPONSE })
    expect(intakeServerFetch).toHaveBeenCalledWith('abc', 'intake/profile', {
      method: 'PUT',
      accessToken: 'jwt',
      body: {
        name: 'Maria Silva',
        email: 'maria@example.com',
        dateOfBirth: '1990-05-20T00:00:00-03:00',
        password: 'Senha@123',
      },
    })
  })

  it('saves the billing address in Brazil', async () => {
    await submitIntakeStep(
      'abc',
      IntakeStepStatus.UpsertAddress,
      {
        zipCode: '01310100',
        street: 'Avenida Paulista',
        number: '1000',
        complement: '',
        district: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
      'jwt',
    )

    expect(intakeServerFetch).toHaveBeenCalledWith('abc', 'intake/address', {
      method: 'PUT',
      accessToken: 'jwt',
      body: {
        address: {
          zipCode: '01310100',
          street: 'Avenida Paulista',
          number: '1000',
          complement: null,
          district: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
        },
      },
    })
  })

  it('creates the payment profile with the gateway token', async () => {
    await submitIntakeStep(
      'abc',
      IntakeStepStatus.PaymentProfile,
      { gatewayToken: 'tok_123', saveForFutureUses: true },
      'jwt',
    )

    expect(intakeServerFetch).toHaveBeenCalledWith(
      'abc',
      'intake/payment-profile',
      {
        method: 'POST',
        accessToken: 'jwt',
        body: { gatewayToken: 'tok_123', saveForFutureUses: true },
      },
    )
  })

  it.each([
    [IntakeStepStatus.UpdateProfile, { name: 'Maria', email: 'x' }],
    [IntakeStepStatus.UpsertAddress, { zipCode: '0131', state: 'São Paulo' }],
    [IntakeStepStatus.PaymentProfile, { gatewayToken: '' }],
  ])('rejects an invalid body for %s', async (status, body) => {
    expect(await submitIntakeStep('abc', status, body, 'jwt')).toEqual({
      ok: false,
      reason: 'invalid-body',
    })
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })

  it.each([
    IntakeStepStatus.UpdateTerm,
    IntakeStepStatus.Biometry,
    IntakeStepStatus.StartSale,
  ])('has nothing to submit for %s', async (status) => {
    expect(await submitIntakeStep('abc', status, {}, 'jwt')).toEqual({
      ok: false,
      reason: 'no-submit',
    })
  })
})
