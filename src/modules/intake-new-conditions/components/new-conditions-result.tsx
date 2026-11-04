import { StatusScreen } from '@/common/components/status-screen'

export function NewConditionsAccepted() {
  return (
    <StatusScreen
      title='Novas condições aceitas'
      description='Sua proposta será enviada para análise do banco parceiro. Agora, é só aguardar. Assim que houver uma atualização, avisaremos você para continuar o processo.'
    />
  )
}

export function ProposalInAnalysis() {
  return (
    <StatusScreen
      tone='info'
      title='Proposta em análise'
      description='A proposta está em análise. Assim que houver uma atualização, avisaremos você pelo WhatsApp para continuar o processo.'
    />
  )
}

export function NewConditionsRefused() {
  return (
    <StatusScreen
      tone='info'
      title='Novas condições recusadas'
      description='Sua proposta foi cancelada e o processo foi encerrado. Não é necessário realizar nenhuma outra ação.'
    />
  )
}
