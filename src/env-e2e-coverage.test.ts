import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const ENV_SOURCE = 'src/env.ts'
const OVERRIDES_FILE = 'e2e/.env.ci'
const SECRET_KEYS_FILE = 'e2e/.env.secret-keys'
const TFVARS_FILES = [
  'terraform/config/staging/terraform.tfvars',
  'terraform/config/production/terraform.tfvars',
]
const AMPLIFY_FILE = 'amplify.yml'

type Declaration = { key: string; optional: boolean }

function declarations(): Declaration[] {
  const source = readFileSync(ENV_SOURCE, 'utf8')
  const found: Declaration[] = []

  for (const block of ['server', 'client']) {
    const body = new RegExp(`${block}:\\s*\\{(.*?)\\n  \\},`, 's').exec(
      source,
    )?.[1]
    if (!body) continue

    for (const line of body.split('\n')) {
      const match = /^\s+([A-Z][A-Z0-9_]*):\s*z\.(.*)$/.exec(line)
      if (match) {
        found.push({ key: match[1], optional: match[2].includes('.optional(') })
      }
    }
  }

  return found
}

function dotenvKeys(path: string): string[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.split('=')[0].trim())
}

function tfvarsKeys(path: string): string[] {
  const body = /environment_variables\s*=\s*\{([\s\S]*?)\n\}/.exec(
    readFileSync(path, 'utf8'),
  )?.[1]
  if (!body) return []

  return [...body.matchAll(/^\s*([A-Z_][A-Z0-9_]*)\s*=/gm)].map((m) => m[1])
}

function amplifySecretNames(): string[] {
  const block = /SECRETS=\(([\s\S]*?)\n\s*\)/.exec(
    readFileSync(AMPLIFY_FILE, 'utf8'),
  )?.[1]
  if (!block) return []

  return [...block.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*$/gm)].map((m) => m[1])
}

describe('e2e environment coverage', () => {
  const declared = declarations()
  const required = declared.filter((d) => !d.optional).map((d) => d.key)
  const overrides = dotenvKeys(OVERRIDES_FILE)
  const fromSecret = dotenvKeys(SECRET_KEYS_FILE)

  it('parses the declarations in src/env.ts', () => {
    expect(required.length).toBeGreaterThan(0)
  })

  it('covers every required variable in the secret or in .env.ci', () => {
    const covered = new Set([...overrides, ...fromSecret])
    const missing = required.filter((key) => !covered.has(key))

    expect(
      missing,
      missing.length === 0
        ? ''
        : `Sem valor no CI: ${missing.join(', ')}.\n` +
            `Escolha um lugar para cada uma:\n` +
            `  - algum spec exercita o fluxo que a usa -> declare em ${SECRET_KEYS_FILE} e ponha o valor real no secret E2E_DOTENV\n` +
            `  - nenhum spec exercita -> ponha um placeholder em ${OVERRIDES_FILE}`,
    ).toEqual([])
  })

  it('does not keep entries for variables removed from src/env.ts', () => {
    const known = new Set(declared.map((d) => d.key))
    const isTestOnly = (key: string) => key.startsWith('E2E_')
    const stale = [...overrides, ...fromSecret].filter(
      (key) => !known.has(key) && !isTestOnly(key),
    )

    expect(
      stale,
      stale.length === 0
        ? ''
        : `Não existem mais no ${ENV_SOURCE}: ${stale.join(', ')}. Remova de ${OVERRIDES_FILE} / ${SECRET_KEYS_FILE}.`,
    ).toEqual([])
  })

  it.each(TFVARS_FILES)(
    'covers every required variable in %s or in the amplify.yml SECRETS list',
    (tfvars) => {
      const fromTfvars = tfvarsKeys(tfvars)
      const fromSsm = amplifySecretNames()

      expect(
        fromTfvars.length,
        `nenhuma chave lida de ${tfvars}`,
      ).toBeGreaterThan(0)
      expect(
        fromSsm.length,
        `nenhum nome lido do array SECRETS`,
      ).toBeGreaterThan(0)

      const covered = new Set([...fromTfvars, ...fromSsm])
      const missing = required.filter((key) => !covered.has(key))

      expect(
        missing,
        missing.length === 0
          ? ''
          : `Sem valor no deploy: ${missing.join(', ')}.\n` +
              `Escolha um lugar para cada uma:\n` +
              `  - pública -> map environment_variables de ${tfvars}\n` +
              `  - secreta -> array SECRETS do ${AMPLIFY_FILE} + parâmetro no SSM`,
      ).toEqual([])
    },
  )
})
