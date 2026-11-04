'use client'

import { Button } from '@twila-digital/components/button'
import { DatePickerField } from '@twila-digital/components/datepicker'
import { Input } from '@twila-digital/components/input'
import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { MaskedInput } from '@/common/components/masked-input'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { useForm } from '@/common/hooks/use-form'
import { getBirthDateRange, toIsoDate } from '@/common/utils/date'
import { onlyDigits } from '@/common/utils/digits'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type { IntakeCreateAccountRequest } from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useIntakeStepSubmit } from '@/modules/intake/hooks/use-intake-step-submit'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import {
  type ApiErrorFieldMap,
  handleApiError,
} from '@/services/api-error-handler'
import { ApiError } from '@/services/error'
import {
  type CreateAccountFormData,
  type CreateAccountFormInput,
  createAccountSchema,
  MAX_AGE,
  MIN_AGE,
} from './schemas/create-account.schema'

const FIELD_ERRORS: ApiErrorFieldMap<CreateAccountFormInput> = {
  'Cpf.CpfAlreadyAdded': {
    field: 'cpf',
    message: 'Este CPF já está cadastrado em outra conta.',
  },
  'Email.EmailAlreadyAdded': {
    field: 'email',
    message: 'Este e-mail já está cadastrado em outra conta.',
  },
  'Account.FirstNameIsRequired': 'firstName',
  'Account.LastNameIsRequired': 'lastName',
  'Account.EmailIsRequired': 'email',
  'Account.InvalidEmail': 'email',
  'Account.CpfIsRequired': 'cpf',
  'Account.InvalidCpf': 'cpf',
  'Account.DateOfBirthIsRequired': 'dateOfBirth',
  'Account.InvalidDateOfBirth': 'dateOfBirth',
  'Account.InvalidMaximumAge': 'dateOfBirth',
}

function toRequest(values: CreateAccountFormData): IntakeCreateAccountRequest {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    cpf: onlyDigits(values.cpf),
    email: values.email,
    dateOfBirth: toIsoDate(values.dateOfBirth),
  }
}

export function IntakeCreateAccount({ token }: IntakeStepScreenProps) {
  const fieldSize = useFieldSize()
  const birthDateRange = useMemo(() => getBirthDateRange(MIN_AGE, MAX_AGE), [])
  const { submit, finish, isSubmitting } =
    useIntakeStepSubmit<IntakeCreateAccountRequest>(
      token,
      IntakeStepStatus.CreateAccount,
    )
  const { control, register, handleSubmit, setError, formState } =
    useForm<CreateAccountFormInput>({
      schema: createAccountSchema,
      defaultValues: {
        firstName: '',
        lastName: '',
        cpf: '',
        dateOfBirth: null,
        email: '',
      },
    })
  const { errors } = formState

  async function onSubmit(values: CreateAccountFormInput) {
    try {
      await submit(toRequest(values as CreateAccountFormData))
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.type === IntakeErrorType.AccountAlreadyExists
      ) {
        await finish()
        return
      }
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
        title='Dados pessoais'
        description='Informe seus dados para continuarmos com a proposta.'
        illustration={ILLUSTRATIONS.personalData}
        action={
          <Button
            type='submit'
            size={fieldSize}
            fullWidth
            loading={isSubmitting}
          >
            Enviar dados pessoais
          </Button>
        }
      >
        <div className='grid desktop:grid-cols-3 tablet:grid-cols-2 gap-md'>
          <Input
            label='Nome'
            placeholder='Ex.: Maria'
            autoComplete='given-name'
            size={fieldSize}
            required
            error={Boolean(errors.firstName)}
            errorMessage={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label='Sobrenome'
            placeholder='Ex.: Silva'
            autoComplete='family-name'
            size={fieldSize}
            required
            error={Boolean(errors.lastName)}
            errorMessage={errors.lastName?.message}
            {...register('lastName')}
          />
          <MaskedInput
            label='CPF'
            placeholder='000.000.000-00'
            mask='000.000.000-00'
            inputMode='numeric'
            size={fieldSize}
            required
            error={Boolean(errors.cpf)}
            errorMessage={errors.cpf?.message}
            {...register('cpf')}
          />
          <Controller
            control={control}
            name='dateOfBirth'
            render={({ field }) => (
              <DatePickerField
                label='Data de nascimento'
                placeholder='dd/mm/aaaa'
                editable
                minDate={birthDateRange.minDate}
                maxDate={birthDateRange.maxDate}
                size={fieldSize}
                required
                value={field.value}
                onValueChange={field.onChange}
                error={Boolean(errors.dateOfBirth)}
                errorMessage={errors.dateOfBirth?.message}
                invalidMessage='Informe uma data válida.'
              />
            )}
          />
          <Input
            label='E-mail'
            type='email'
            placeholder='Ex.: maria@email.com'
            autoComplete='email'
            size={fieldSize}
            required
            error={Boolean(errors.email)}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
          <Input
            label='Telefone'
            placeholder='(00) 00000-0000'
            size={fieldSize}
            required
            disabled
            hint='Usaremos o celular que recebeu o código.'
          />
        </div>
      </IntakeStepLayout>
    </form>
  )
}
