type StatusCopy = { title: string; description: string }

type IntakeFlowStep = 'biometrics' | 'finished'

export const intakeFlowCopyRecord: Record<IntakeFlowStep, StatusCopy> = {
  biometrics: {
    title: 'Confirme sua identidade e assine a CCB',
    description:
      'Faça a biometria e a assinatura do contrato. Leva cerca de 5 minutos.',
  },
  finished: {
    title: 'Proposta finalizada com sucesso! 🎉',
    description: 'Você finalizou sua proposta e está tudo certo.',
  },
}
