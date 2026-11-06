import './src/env'
import type { NextConfig } from 'next'

const MAINTENANCE_ROUTE = '/manutencao'

const NOT_REDIRECTED_IN_MAINTENANCE = [
  'manutencao',
  'favicon\\.ico',
  'icon\\.svg',
  'robots\\.txt',
]

const MAINTENANCE_REDIRECT_SOURCE = `/:path((?!${NOT_REDIRECTED_IN_MAINTENANCE.join('$|')}$).*)`

const isInMaintenance = process.env.NEXT_PUBLIC_IN_MAINTENANCE === 'true'

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  experimental: {
    agentUpgrade: 'security',
  },
  async redirects() {
    if (isInMaintenance) {
      return [
        {
          source: MAINTENANCE_REDIRECT_SOURCE,
          destination: MAINTENANCE_ROUTE,
          permanent: false,
        },
      ]
    }

    return [
      {
        source: MAINTENANCE_ROUTE,
        destination: '/',
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
