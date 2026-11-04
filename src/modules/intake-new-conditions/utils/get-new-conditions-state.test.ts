import { describe, expect, it } from 'vitest'
import { newCondition } from '@/tests/new-condition-mocks'
import { getNewConditionsState } from './get-new-conditions-state'

describe('getNewConditionsState', () => {
  it('keeps only the pending conditions, ordered by term', () => {
    const state = getNewConditionsState([
      newCondition({ simulationId: 'a', term: 36 }),
      newCondition({ simulationId: 'b', term: 12, status: 'Expired' }),
      newCondition({ simulationId: 'c', term: 24 }),
    ])

    expect(state).toEqual({
      kind: 'pending',
      conditions: [
        expect.objectContaining({ simulationId: 'c' }),
        expect.objectContaining({ simulationId: 'a' }),
      ],
    })
  })

  it.each([
    ['Refused', 'refused'],
    ['Accepted', 'accepted'],
    ['Expired', 'empty'],
  ])(
    'uses the latest decision when nothing is pending (%s)',
    (status, kind) => {
      const state = getNewConditionsState([
        newCondition({ status: 'Expired' }),
        newCondition({ status }),
      ])

      expect(state).toEqual({ kind })
    },
  )

  it('treats an empty list as no counter-proposal', () => {
    expect(getNewConditionsState([])).toEqual({ kind: 'empty' })
  })
})
