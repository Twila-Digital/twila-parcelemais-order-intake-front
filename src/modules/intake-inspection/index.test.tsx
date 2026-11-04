import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import { IntakeInspection } from '.'

vi.mock('next/image', () => ({ default: () => null }))

describe('IntakeInspection', () => {
  it('tells the link for the inspection comes by WhatsApp, with no action here', () => {
    render(
      <IntakeInspection
        token='abc'
        flow={IntakeFlow.Seller}
        header={<p>cabeçalho</p>}
        data={undefined}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Realize a vistoria do veículo' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Você vai receber pelo WhatsApp o link para realizar a vistoria no site do nosso parceiro.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('cabeçalho')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
