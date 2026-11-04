'use client'

import { Combobox } from '@twila-digital/components/combobox'
import { Input } from '@twila-digital/components/input'
import { type ChangeEvent, useMemo } from 'react'
import { type Control, Controller, type UseFormRegister } from 'react-hook-form'
import { MaskedInput } from '@/common/components/masked-input'
import { selectedComboboxValue } from '@/common/utils/combobox-value'
import { fieldError } from '@/common/utils/field-error'
import { createPlateMask } from '@/common/utils/plate'
import { vehicleColorsOptions } from '../options/vehicle-colors.options'
import type { VehicleInformationFormData } from '../schemas/vehicle-information.schema'

const RENAVAM_MASK = '00000000000'
const YEAR_MASK = '0000'

const colorItems = [...vehicleColorsOptions.values()].map((option) => ({
  label: String(option.label),
  value: String(option.value),
}))

type VehicleInformationFieldsProps = {
  control: Control<VehicleInformationFormData>
  register: UseFormRegister<VehicleInformationFormData>
  errors: Partial<
    Record<keyof VehicleInformationFormData, { message?: string }>
  >
  size: 'md' | 'lg'
}

function handleUppercase(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void,
) {
  const upperCaseValue = event.target.value.toUpperCase()
  event.target.value = upperCaseValue
  onChange(upperCaseValue)
}

export function VehicleInformationFields({
  control,
  register,
  errors,
  size,
}: VehicleInformationFieldsProps) {
  const plateMask = useMemo(() => createPlateMask(), [])

  return (
    <div className='grid desktop:grid-cols-6 tablet:grid-cols-2 gap-md tablet:gap-lg'>
      <div className='desktop:col-span-3'>
        <Controller
          control={control}
          name='plate'
          render={({ field: { onChange, onBlur, value } }) => (
            <MaskedInput
              label='Placa'
              id='plate'
              mask={plateMask}
              placeholder='ABC1D23'
              autoCapitalize='characters'
              size={size}
              required
              value={value}
              onChange={(event) => handleUppercase(event, onChange)}
              onBlur={onBlur}
              {...fieldError(errors.plate?.message)}
            />
          )}
        />
      </div>

      <div className='desktop:col-span-3'>
        <MaskedInput
          label='Renavam'
          id='renavam'
          mask={RENAVAM_MASK}
          inputMode='numeric'
          placeholder='12345678901'
          size={size}
          required
          {...fieldError(errors.renavam?.message)}
          {...register('renavam')}
        />
      </div>

      <div className='desktop:col-span-2'>
        <Controller
          control={control}
          name='color'
          render={({ field: { onChange, onBlur, value } }) => (
            <Combobox
              label='Cor'
              placeholder='Prata'
              searchPlaceholder='Procure por uma cor'
              emptyMessage='Nenhuma cor encontrada'
              size={size}
              required
              items={colorItems}
              value={selectedComboboxValue(value, colorItems)}
              onValueChange={(next) => onChange(next ?? '')}
              onBlur={onBlur}
              {...fieldError(errors.color?.message)}
            />
          )}
        />
      </div>

      <div className='desktop:col-span-2'>
        <Controller
          control={control}
          name='chassi'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label='Chassi'
              id='chassi'
              placeholder='9BWZZZ377VT004251'
              autoCapitalize='characters'
              maxLength={17}
              size={size}
              required
              value={value}
              onChange={(event) => handleUppercase(event, onChange)}
              onBlur={onBlur}
              {...fieldError(errors.chassi?.message)}
            />
          )}
        />
      </div>

      <div className='desktop:col-span-2'>
        <MaskedInput
          label='Ano de fabricação'
          id='manufactureYear'
          mask={YEAR_MASK}
          inputMode='numeric'
          placeholder='2023'
          size={size}
          required
          {...fieldError(errors.manufactureYear?.message)}
          {...register('manufactureYear')}
        />
      </div>
    </div>
  )
}
