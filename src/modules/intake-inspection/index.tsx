import { ILLUSTRATIONS } from '@/constants/illustrations'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'

export function IntakeInspection({ header }: IntakeStepScreenProps) {
  return (
    <IntakeStepLayout
      header={header}
      title='Realize a vistoria do veículo'
      description='Você vai receber pelo WhatsApp o link para realizar a vistoria no site do nosso parceiro.'
      illustration={ILLUSTRATIONS.inspection}
      largeDescription
      action={null}
    />
  )
}
