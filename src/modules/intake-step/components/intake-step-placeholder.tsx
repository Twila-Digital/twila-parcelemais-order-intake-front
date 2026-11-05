import { Alert } from '@twila-digital/components/alert'
import type { ReactNode } from 'react'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'

type IntakeStepPlaceholderProps = {
  header: ReactNode
  title: string
  description: string
}

export function IntakeStepPlaceholder({
  header,
  title,
  description,
}: IntakeStepPlaceholderProps) {
  return (
    <IntakeStepLayout
      header={header}
      title={title}
      description={description}
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
