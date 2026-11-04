import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './error'

describe('ErrorPage', () => {
  it('renders the design system error state linking back home by default', () => {
    render(<ErrorPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('Ops! Algo deu errado')
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' }),
    ).toHaveAttribute('href', '/')
  })

  it('calls the action when provided', async () => {
    const onAction = vi.fn()
    render(
      <ErrorPage
        title='Algo deu errado'
        actionLabel='Tentar novamente'
        onAction={onAction}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    )

    expect(onAction).toHaveBeenCalledOnce()
  })
})
