import { defineConfig, devices } from '@playwright/test'

const nodeEnv = process.env.NODE_ENV

try {
  process.loadEnvFile('e2e/.env.ci')
} catch {}

try {
  process.loadEnvFile('.env.local')
  process.env.VALIDATE_ENV = '1'
} catch {}
if (nodeEnv === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV')
else Reflect.set(process.env, 'NODE_ENV', nodeEnv)

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const isCI = !!process.env.CI

const chromium = { ...devices['Desktop Chrome'] }
const mobile = { ...devices['Pixel 7'] }

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  workers: isCI ? 2 : 6,
  forbidOnly: isCI,
  retries: 1,
  maxFailures: isCI ? 1 : undefined,
  reporter: isCI ? [['list'], ['github']] : 'html',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: isCI ? 'off' : 'on-first-retry',
    screenshot: isCI ? 'off' : 'only-on-failure',
    video: isCI ? 'off' : 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'e2e', testMatch: '**/*.e2e-spec.ts', use: chromium },
    { name: 'e2e-mobile', testMatch: '**/*.e2e-spec.ts', use: mobile },
  ],
  webServer: {
    command: isCI ? 'npm run build && npm run start' : 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: isCI ? 300_000 : 120_000,
  },
})
