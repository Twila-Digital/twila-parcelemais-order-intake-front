'use client'

import { faCopy } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import { IconButton } from '@twila-digital/components/icon-button'
import { Input } from '@twila-digital/components/input'
import { Tabs, TabsList, TabsTab } from '@twila-digital/components/tabs'
import { Controller } from 'react-hook-form'
import { MaskedInput } from '@/common/components/masked-input'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { useForm } from '@/common/hooks/use-form'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type {
  IntakeNotifySellerRequest,
  IntakeNotifySellerStepData,
} from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useIntakeStepSubmit } from '@/modules/intake/hooks/use-intake-step-submit'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import {
  type ApiErrorFieldMap,
  handleApiError,
} from '@/services/api-error-handler'
import {
  type SellerDataFormData,
  sellerDataSchema,
} from './schemas/seller-data.schema'

const SELLER_TYPES = [
  { value: 'Individual', label: 'Vendedor (pessoa física)' },
  { value: 'Store', label: 'Loja (CNPJ)' },
] as const

const FIELD_ERRORS: ApiErrorFieldMap<SellerDataFormData> = {
  'Intake.NotifySellerPhoneInvalid': 'phoneNumber',
  'Proposal.SellerEmailIsRequired': 'email',
  'Proposal.InvalidEmail': 'email',
}

export function IntakeSellerData({
  token,
  header,
  data,
}: IntakeStepScreenProps<IntakeNotifySellerStepData>) {
  const fieldSize = useFieldSize()
  const { submit, isSubmitting } =
    useIntakeStepSubmit<IntakeNotifySellerRequest>(
      token,
      IntakeStepStatus.NotifySeller,
    )
  const { control, register, handleSubmit, setError, formState } =
    useForm<SellerDataFormData>({
      schema: sellerDataSchema,
      defaultValues: { sellerType: 'Individual', phoneNumber: '', email: '' },
    })

  async function onSubmit(values: SellerDataFormData) {
    try {
      await submit(values)
    } catch (error) {
      handleApiError(error, { setError, fieldMap: FIELD_ERRORS })
    }
  }

  async function copySellerLink(sellerLink: string) {
    try {
      await navigator.clipboard.writeText(sellerLink)
      toast.success({ title: 'Link copiado', orientation: 'horizontal' })
    } catch {
      toast.error({
        title: 'Não foi possível copiar o link',
        orientation: 'horizontal',
      })
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
        title='Dados do vendedor'
        description='Selecione o tipo de vendedor e preencha os dados dele abaixo.'
        illustration={ILLUSTRATIONS.sellerData}
        action={
          <Button
            type='submit'
            size={fieldSize}
            fullWidth
            loading={isSubmitting}
          >
            Enviar dados do vendedor
          </Button>
        }
      >
        <Controller
          control={control}
          name='sellerType'
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <TabsList asTags aria-label='Tipo de vendedor'>
                {SELLER_TYPES.map((type) => (
                  <TabsTab key={type.value} value={type.value}>
                    {type.label}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          )}
        />

        <div className='grid tablet:grid-cols-2 gap-md tablet:gap-lg'>
          <MaskedInput
            label='Celular'
            placeholder='(00) 00000-0000'
            mask='(00) 00000-0000'
            inputMode='tel'
            size={fieldSize}
            required
            error={Boolean(formState.errors.phoneNumber)}
            errorMessage={formState.errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <Input
            label='E-mail'
            type='email'
            placeholder='seuemail@email.com.br'
            autoComplete='off'
            size={fieldSize}
            required
            error={Boolean(formState.errors.email)}
            errorMessage={formState.errors.email?.message}
            {...register('email')}
          />
        </div>

        {data.sellerLink && (
          <div className='flex items-center gap-md'>
            <p className='flex-1 break-all rounded-sm border border-brand-primary-5 bg-brand-primary-1 p-lg font-medium text-body-14'>
              Envie o link ao vendedor: {data.sellerLink}
            </p>
            <IconButton
              variant='tertiary'
              size='md'
              onClick={() => data.sellerLink && copySellerLink(data.sellerLink)}
              aria-label='Copiar link do vendedor'
            >
              <FontAwesomeIcon icon={faCopy} aria-hidden />
            </IconButton>
          </div>
        )}
      </IntakeStepLayout>
    </form>
  )
}
