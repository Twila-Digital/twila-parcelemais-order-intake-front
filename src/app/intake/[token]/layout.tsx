import { headers } from 'next/headers'
import { FieldSizeProvider } from '@/common/components/field-size-provider'
import { PageShell } from '@/common/components/page-shell'
import { isMobileUserAgent } from '@/common/lib/device'
import { IntakeLoadingProvider } from '@/modules/intake/components/intake-loading-provider'
import { IntakeRealtimeProvider } from '@/modules/intake/components/intake-realtime-provider'
import { IntakeUnavailable } from '@/modules/intake/components/intake-unavailable'
import { getIntakeStart } from '@/services/http/intake/server/get-intake-start'
import { getIntakeAccessToken } from '@/services/http/intake/server/intake-session'

export default async function IntakeLayout({
  children,
  params,
}: LayoutProps<'/intake/[token]'>) {
  const { token } = await params
  const start = await getIntakeStart(token)
  const userAgent = (await headers()).get('user-agent')
  const fieldSize = isMobileUserAgent(userAgent) ? 'md' : 'lg'

  if (!start.ok) {
    return (
      <FieldSizeProvider initialSize={fieldSize}>
        <PageShell>
          <IntakeUnavailable reason={start.reason} />
        </PageShell>
      </FieldSizeProvider>
    )
  }

  const hasSession = Boolean(await getIntakeAccessToken(token))

  return (
    <FieldSizeProvider initialSize={fieldSize}>
      <PageShell>
        <IntakeLoadingProvider>
          {hasSession ? (
            <IntakeRealtimeProvider token={token}>
              {children}
            </IntakeRealtimeProvider>
          ) : (
            children
          )}
        </IntakeLoadingProvider>
      </PageShell>
    </FieldSizeProvider>
  )
}
