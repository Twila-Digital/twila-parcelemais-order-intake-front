import { Alert } from '@twila-digital/components/alert'
import type { ReactNode } from 'react'
import type { Illustration } from '@/constants/illustrations'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'

type IntakeStepPlaceholderProps = {
  header: ReactNode
  title: string
  description: string
  illustration: Illustration
}

export function IntakeStepPlaceholder({
  header,
  title,
  description,
  illustration,
}: IntakeStepPlaceholderProps) {
  return (
    <IntakeStepLayout
      header={header}
      title={title}
      description={description}
      illustration={illustration}
      action={null}
    >
      <Alert
        type='information'
        orientation='vertical'
        title='Etapa em construção'
        description='Esta etapa ainda não está disponível por aqui. Volte para o WhatsApp para seguir com seu pedido.'
      />
    </IntakeStepLayout>
  )
}
