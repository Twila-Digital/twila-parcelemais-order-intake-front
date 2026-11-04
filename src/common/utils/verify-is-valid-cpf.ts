import { cpf } from 'cpf-cnpj-validator'

export function verifyIsValidCpf(cpfValue: string): boolean {
  return cpf.isValid(cpfValue)
}
