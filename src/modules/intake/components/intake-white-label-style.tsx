import {
  createWhiteLabelTheme,
  WhiteLabelStyle,
} from '@twila-digital/components/white-label'
import { lightenUntilReadable, readableOnWhite } from '@/common/lib/color'
import type { IntakeWhiteLabel } from '@/domain/intake.domain'

type IntakeWhiteLabelStyleProps = {
  whiteLabel: IntakeWhiteLabel | null
}

const PAGE_TEXT_COLOR = '#62636c'
const DARK_TEXT_COLOR = '#1e1f24'
const TEXT_MIN_CONTRAST = 4.5
const ICON_MIN_CONTRAST = 3

function getIntakeVars({ colors }: IntakeWhiteLabel) {
  const pageBackground = colors.tertiary
    ? lightenUntilReadable(colors.tertiary, PAGE_TEXT_COLOR, TEXT_MIN_CONTRAST)
    : null
  const secondaryForeground = colors.secondary
    ? readableOnWhite(colors.secondary, DARK_TEXT_COLOR, ICON_MIN_CONTRAST)
    : null

  return [
    `--intake-page-bg-to:${pageBackground ?? 'var(--color-brand-primary-3)'}`,
    `--intake-secondary-fg:${secondaryForeground ?? 'var(--color-brand-secondary-9)'}`,
  ].join(';')
}

export function IntakeWhiteLabelStyle({
  whiteLabel,
}: IntakeWhiteLabelStyleProps) {
  if (!whiteLabel?.applied) return null

  const theme = createWhiteLabelTheme({
    primary: whiteLabel.colors.primary,
    secondary: whiteLabel.colors.secondary,
    tertiary: whiteLabel.colors.tertiary,
    buttonRadius: whiteLabel.cornerStyle.buttonRadius,
    fieldRadius: whiteLabel.cornerStyle.fieldRadius,
    cornerCode: whiteLabel.cornerStyle.code,
    titleFont: whiteLabel.fonts.title,
    textFont: whiteLabel.fonts.subtitle,
  })

  return (
    <>
      {theme.fontsHref && (
        <link rel='stylesheet' href={theme.fontsHref} precedence='default' />
      )}
      <WhiteLabelStyle theme={theme} />
      <style>{`${theme.selector}{${getIntakeVars(whiteLabel)}}`}</style>
    </>
  )
}
