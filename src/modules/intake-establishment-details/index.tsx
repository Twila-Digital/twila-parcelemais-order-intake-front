'use client'

import { Button } from '@twila-digital/components/button'
import { DatePickerField } from '@twila-digital/components/datepicker'
import { Input } from '@twila-digital/components/input'
import IMask from 'imask'
import { Controller } from 'react-hook-form'
import { MaskedInput } from '@/common/components/masked-input'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { useForm } from '@/common/hooks/use-form'
import { toIsoDate } from '@/common/utils/date'
import { onlyDigits } from '@/common/utils/digits'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import { BRAZIL_PHONE_PREFIX } from '@/constants/intake'
import type { IntakeEstablishmentDetailsRequest } from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useIntakeStepSubmit } from '@/modules/intake/hooks/use-intake-step-submit'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import {
  type ApiErrorFieldMap,
  handleApiError,
} from '@/services/api-error-handler'
import {
  type EstablishmentDetailsFormData,
  type EstablishmentDetailsFormInput,
  establishmentDetailsSchema,
} from './schemas/establishment-details.schema'

const PHONE_MASK = IMask.createMask({
  mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }],
})

const FIELD_ERRORS: ApiErrorFieldMap<EstablishmentDetailsFormInput> = {
  'Proposal.DocumentIsRequired': 'document',
  'Proposal.Invalid': 'document',
  'Proposal.EstablishmentDocumentDoesNotMatchDepositAccountHolder': {
    field: 'document',
    message: 'O CNPJ precisa ser o mesmo do titular da conta para depósito.',
  },
  'Proposal.SellerEmailIsRequired': 'email',
  'Proposal.InvalidEmail': 'email',
  'Proposal.SellerPhoneIsRequired': 'phone',
  'Proposal.InvalidPhone': 'phone',
  'Proposal.TradeNameIsRequired': 'tradeName',
  'Proposal.LegalNameIsRequired': 'legalName',
  'Proposal.OpeningDateIsRequired': 'openingDate',
  'Proposal.OpeningDateCannotBeInFuture': 'openingDate',
}

function toRequest(
  values: EstablishmentDetailsFormData,
): IntakeEstablishmentDetailsRequest {
  return {
    tradeName: values.tradeName,
    legalName: values.legalName,
    document: onlyDigits(values.document),
    phone: `${BRAZIL_PHONE_PREFIX}${onlyDigits(values.phone)}`,
    email: values.email,
    openingDate: toIsoDate(values.openingDate),
  }
}

export function IntakeEstablishmentDetails({
  token,
  header,
}: IntakeStepScreenProps) {
  const fieldSize = useFieldSize()
  const { submit, isSubmitting } =
    useIntakeStepSubmit<IntakeEstablishmentDetailsRequest>(
      token,
      IntakeStepStatus.IncludeEstablishmentDetails,
    )
  const { control, register, handleSubmit, setError, formState } =
    useForm<EstablishmentDetailsFormInput>({
      schema: establishmentDetailsSchema,
      defaultValues: {
        document: '',
        openingDate: null,
        legalName: '',
        tradeName: '',
        phone: '',
        email: '',
      },
    })
  const { errors } = formState

  async function onSubmit(values: EstablishmentDetailsFormInput) {
    try {
      await submit(toRequest(values as EstablishmentDetailsFormData))
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
        title='Dados da empresa'
        description='Agora precisamos que você envie os dados da empresa.'
        illustration={ILLUSTRATIONS.companyData}
        action={
          <Button
            type='submit'
            size={fieldSize}
            fullWidth
            loading={isSubmitting}
          >
            Enviar dados da empresa
          </Button>
        }
      >
        <div className='grid tablet:grid-cols-2 gap-md'>
          <MaskedInput
            label='CNPJ'
            placeholder='00.000.000/0000-00'
            mask='00.000.000/0000-00'
            inputMode='numeric'
            size={fieldSize}
            required
            error={Boolean(errors.document)}
            errorMessage={errors.document?.message}
            {...register('document')}
          />
          <Controller
            control={control}
            name='openingDate'
            render={({ field }) => (
              <DatePickerField
                label='Data de abertura da empresa'
                placeholder='dd/mm/aaaa'
                editable
                maxDate={new Date()}
                yearRange={{ from: 1900, to: new Date().getFullYear() }}
                size={fieldSize}
                required
                value={field.value}
                onValueChange={field.onChange}
                error={Boolean(errors.openingDate)}
                errorMessage={errors.openingDate?.message}
                invalidMessage='Informe uma data válida.'
              />
            )}
          />
          <Input
            label='Razão social'
            placeholder='Ex.: Credicarro Serviços Financeiros Ltda.'
            autoComplete='organization'
            size={fieldSize}
            required
            error={Boolean(errors.legalName)}
            errorMessage={errors.legalName?.message}
            {...register('legalName')}
          />
          <Input
            label='Nome fantasia'
            placeholder='Ex.: Credicarro'
            size={fieldSize}
            required
            error={Boolean(errors.tradeName)}
            errorMessage={errors.tradeName?.message}
            {...register('tradeName')}
          />
          <MaskedInput
            label='Telefone'
            placeholder='(00) 00000-0000'
            mask={PHONE_MASK}
            inputMode='tel'
            autoComplete='tel-national'
            size={fieldSize}
            required
            error={Boolean(errors.phone)}
            errorMessage={errors.phone?.message}
            {...register('phone')}
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
        </div>
      </IntakeStepLayout>
    </form>
  )
}
