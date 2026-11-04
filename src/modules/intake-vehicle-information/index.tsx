'use client'

import { Button } from '@twila-digital/components/button'
import { useMemo } from 'react'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { useForm } from '@/common/hooks/use-form'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type { IntakeVehicleInformationRequest } from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useIntakeStepSubmit } from '@/modules/intake/hooks/use-intake-step-submit'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import { handleApiError } from '@/services/api-error-handler'
import { VehicleInformationFields } from './components/vehicle-information-fields'
import { vehicleInformationErrorMap } from './schemas/vehicle-information.error-map'
import {
  createVehicleInformationSchema,
  type VehicleInformationFormData,
} from './schemas/vehicle-information.schema'

type IntakeVehicleInformationData = {
  modelYear?: number
}

export function IntakeVehicleInformation({
  token,
  header,
  data,
}: IntakeStepScreenProps<IntakeVehicleInformationData>) {
  const fieldSize = useFieldSize()
  const schema = useMemo(
    () => createVehicleInformationSchema(data.modelYear),
    [data.modelYear],
  )
  const { submit, isSubmitting } =
    useIntakeStepSubmit<IntakeVehicleInformationRequest>(
      token,
      IntakeStepStatus.IncludeVehicleExtraInformation,
    )
  const { control, register, handleSubmit, setError, formState } =
    useForm<VehicleInformationFormData>({
      schema,
      defaultValues: {
        plate: '',
        renavam: '',
        color: '',
        chassi: '',
        manufactureYear: '',
      },
    })

  async function onSubmit({
    plate,
    renavam,
    color,
    chassi,
    manufactureYear,
  }: VehicleInformationFormData) {
    try {
      await submit({
        licensePlate: plate,
        renavam,
        color,
        chassi,
        manufactureYear: Number(manufactureYear),
      })
    } catch (error) {
      handleApiError(error, { setError, fieldMap: vehicleInformationErrorMap })
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
        title='Dados complementares'
        description='Nesta etapa, informe os dados complementares do veículo.'
        illustration={ILLUSTRATIONS.vehicleInformation}
        action={
          <Button
            type='submit'
            size={fieldSize}
            fullWidth
            loading={isSubmitting}
          >
            Enviar dados complementares
          </Button>
        }
      >
        <VehicleInformationFields
          control={control}
          register={register}
          errors={formState.errors}
          size={fieldSize}
        />
      </IntakeStepLayout>
    </form>
  )
}
