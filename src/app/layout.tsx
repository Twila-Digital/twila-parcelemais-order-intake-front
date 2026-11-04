import { config } from '@fortawesome/fontawesome-svg-core'
import type { Metadata, Viewport } from 'next'
import { Archivo, Roboto } from 'next/font/google'
import type { ReactNode } from 'react'
import { defaultConfig } from 'tailwind-variants'
import { getDatadogConfig } from '@/config/datadog-config'
import { DatadogInit } from '@/config/datadog-init'
import { tailwindMergeConfig } from '@/constants/tailwind-merge-config'
import { AppProvider } from '@/services/providers/app-provider'
import '@fortawesome/fontawesome-svg-core/styles.css'
import './globals.css'

config.autoAddCss = false

defaultConfig.twMergeConfig = tailwindMergeConfig

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})
const archivo = Archivo({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-archivo',
})

export const metadata: Metadata = {
  title: 'Pedido | Parcele Mais',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const isInMaintenance = process.env.NEXT_PUBLIC_IN_MAINTENANCE === 'true'

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const datadogConfig = getDatadogConfig()

  return (
    <html
      lang='pt-BR'
      className={`${roboto.variable} ${archivo.variable}`}
      data-brand='parcelemais'
      data-mode='light'
    >
      <body className='flex min-h-dvh flex-col font-text'>
        {isInMaintenance ? (
          children
        ) : (
          <>
            <DatadogInit {...datadogConfig} />

            <AppProvider datadogConfig={datadogConfig}>{children}</AppProvider>
          </>
        )}
      </body>
    </html>
  )
}
