import { render } from '@testing-library/react'
import { getContrastRatio } from '@twila-digital/components/white-label'
import { describe, expect, it } from 'vitest'
import type { IntakeWhiteLabel } from '@/domain/intake.domain'
import { IntakeWhiteLabelStyle } from './intake-white-label-style'

const WHITE_LABEL: IntakeWhiteLabel = {
  applied: true,
  logoUrl: null,
  colors: { primary: '#073B4C', secondary: '#ECEAEA', tertiary: '#FFF1EE' },
  cornerStyle: { code: 'pill', buttonRadius: '9999px', fieldRadius: '9999px' },
  fonts: { title: null, subtitle: null },
}

const styles = (container: HTMLElement) =>
  [...container.querySelectorAll('style')].map((style) => style.textContent)

describe('IntakeWhiteLabelStyle', () => {
  it('ends the page gradient in the tertiary color and keeps a light secondary readable', () => {
    const { container } = render(
      <IntakeWhiteLabelStyle whiteLabel={WHITE_LABEL} />,
    )

    const css = styles(container).join('')
    expect(css).toContain('--intake-page-bg-to:#fff1ee')
    expect(css).toContain('--intake-secondary-fg:#1e1f24')
  })

  it('lightens a dark tertiary color so the gray text stays readable', () => {
    const { container } = render(
      <IntakeWhiteLabelStyle
        whiteLabel={{
          ...WHITE_LABEL,
          colors: {
            primary: '#000000',
            secondary: '#073B4C',
            tertiary: '#111111',
          },
        }}
      />,
    )

    const css = styles(container).join('')
    const background = /--intake-page-bg-to:(#[\da-f]{6})/.exec(css)?.[1]
    expect(background).toBeDefined()
    expect(
      getContrastRatio('#62636c', background as string),
    ).toBeGreaterThanOrEqual(4.5)
    expect(css).toContain('--intake-secondary-fg:#073b4c')
  })

  it('keeps the default brand gradient without a white label', () => {
    const { container } = render(<IntakeWhiteLabelStyle whiteLabel={null} />)

    expect(styles(container)).toEqual([])
  })
})
