'use client'

import { Button } from '@twila-digital/components/button'
import { Input } from '@twila-digital/components/input'
import { SelectField } from '@twila-digital/components/select'
import { Controller } from 'react-hook-form'
import { MaskedInput } from '@/common/components/masked-input'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { useForm } from '@/common/hooks/use-form'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import { onlyDigits } from '@/common/utils/digits'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type {
  IntakeDepositAccountRequest,
  IntakeDepositAccountStepData,
} from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useIntakeStepSubmit } from '@/modules/intake/hooks/use-intake-step-submit'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import {
  type ApiErrorFieldMap,
  handleApiError,
} from '@/services/api-error-handler'
import {
  type DepositAccountFormData,
  type DepositAccountFormInput,
  getDepositAccountSchema,
} from './schemas/deposit-account.schema'

const ACCOUNT_TYPES = [
  { value: 'Checking', label: 'Conta corrente' },
  { value: 'Savings', label: 'Conta poupança' },
  { value: 'Payment', label: 'Conta de pagamento' },
]

const FIELD_ERRORS: ApiErrorFieldMap<DepositAccountFormInput> = {
  'Proposal.AccountNumberIsRequired': 'account',
  'Proposal.AccountNumberContainsSpecialCharacters': 'account',
  'Proposal.AccountNumberInvalidFormat': 'account',
  'Proposal.AgencyNumberIsRequired': 'agency',
  'Proposal.AgencyNumberMustHaveFourDigits': 'agency',
  'Proposal.BankNumberIsRequired': 'bankCode',
  'Proposal.BankNumberInvalidFormat': 'bankCode',
  'Proposal.InvalidBankCode': 'bankCode',
  'Proposal.AccountDigitIsRequired': 'accountDigit',
  'Proposal.AccountDigitInvalidFormat': 'accountDigit',
  'Proposal.AgencyDigitIsRequired': 'agencyDigit',
  'Proposal.AgencyDigitInvalidFormat': 'agencyDigit',
  'Proposal.AccountTypeIsRequired': 'accountType',
  'Intake.HolderDocumentIsInvalid': 'holderDocument',
  'Intake.DepositAccountHolderMismatch': {
    field: 'holderDocument',
    message: 'O titular precisa ser você: informe o seu CPF.',
  },
  'Intake.DepositAccountHolderMustBeCnpj': {
    field: 'holderDocument',
    message: 'Para loja, o titular precisa ser o CNPJ da empresa.',
  },
}

const HOLDER_DOCUMENT_FIELD = {
  Cpf: { label: 'CPF', mask: '000.000.000-00' },
  Cnpj: { label: 'CNPJ', mask: '00.000.000/0000-00' },
}

export function IntakeDepositAccount({
  token,
  flow,
  header,
  data,
}: IntakeStepScreenProps<IntakeDepositAccountStepData>) {
  const copy = intakeFlowCopyRecord[flow].depositAccount
  const fieldSize = useFieldSize()
  const holderField = HOLDER_DOCUMENT_FIELD[data.holderDocumentType]
  const { submit, isSubmitting } =
    useIntakeStepSubmit<IntakeDepositAccountRequest>(
      token,
      IntakeStepStatus.IncludeDepositAccount,
    )
  const { control, register, handleSubmit, setError, formState } =
    useForm<DepositAccountFormInput>({
      schema: getDepositAccountSchema(data.holderDocumentType),
      defaultValues: {
        agency: '',
        agencyDigit: '',
        account: '',
        accountDigit: '',
        holderDocument: '',
      },
    })
  const { errors } = formState

  const bankItems = data.banks.map((bank) => ({
    value: bank.number,
    label: `${bank.number} - ${bank.name}`,
  }))

  async function onSubmit(values: DepositAccountFormInput) {
    try {
      await submit(values as DepositAccountFormData)
    } catch (error) {
      handleApiError(error, { setError, fieldMap: FIELD_ERRORS })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className='flex flex-1 flex-col'
    >
      <IntakeStepLayout
        header={header}
        title={copy.title}
        description={copy.description}
        illustration={ILLUSTRATIONS.bank}
        action={
          <Button
            type='submit'
            size={fieldSize}
            fullWidth
            loading={isSubmitting}
          >
            Enviar dados bancários
          </Button>
        }
      >
        <div className='flex flex-col gap-md'>
          <div className='grid tablet:grid-cols-3 gap-md'>
            <MaskedInput
              label={holderField.label}
              placeholder={holderField.mask}
              mask={holderField.mask}
              inputMode='numeric'
              size={fieldSize}
              required
              error={Boolean(errors.holderDocument)}
              errorMessage={errors.holderDocument?.message}
              {...register('holderDocument')}
            />
            <Controller
              control={control}
              name='bankCode'
              render={({ field }) => (
                <SelectField<string | null>
                  label='Banco'
                  placeholder='Selecione'
                  required
                  size={fieldSize}
                  items={bankItems}
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value ?? '')}
                  onBlur={field.onBlur}
                  error={Boolean(errors.bankCode)}
                  errorMessage={errors.bankCode?.message}
                />
              )}
            />
            <Controller
              control={control}
              name='accountType'
              render={({ field }) => (
                <SelectField<string | null>
                  label='Tipo da conta'
                  placeholder='Selecione'
                  required
                  size={fieldSize}
                  items={ACCOUNT_TYPES}
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value ?? undefined)}
                  onBlur={field.onBlur}
                  error={Boolean(errors.accountType)}
                  errorMessage={errors.accountType?.message}
                />
              )}
            />
          </div>

          <div className='grid grid-cols-[1fr_100px] tablet:grid-cols-[1fr_150px_1fr_150px] gap-md'>
            <Input
              label='Agência'
              placeholder='0001'
              inputMode='numeric'
              maxLength={4}
              size={fieldSize}
              required
              error={Boolean(errors.agency)}
              errorMessage={errors.agency?.message}
              {...register('agency', { setValueAs: onlyDigits })}
            />
            <Input
              label='Dígito'
              placeholder='0'
              inputMode='numeric'
              maxLength={1}
              size={fieldSize}
              required
              error={Boolean(errors.agencyDigit)}
              errorMessage={errors.agencyDigit?.message}
              {...register('agencyDigit', { setValueAs: onlyDigits })}
            />
            <Input
              label='Conta'
              placeholder='12345678'
              inputMode='numeric'
              maxLength={13}
              size={fieldSize}
              required
              error={Boolean(errors.account)}
              errorMessage={errors.account?.message}
              {...register('account', { setValueAs: onlyDigits })}
            />
            <Input
              label='Dígito'
              placeholder='9'
              inputMode='numeric'
              maxLength={1}
              size={fieldSize}
              required
              error={Boolean(errors.accountDigit)}
              errorMessage={errors.accountDigit?.message}
              {...register('accountDigit')}
            />
          </div>
        </div>
      </IntakeStepLayout>
    </form>
  )
}
