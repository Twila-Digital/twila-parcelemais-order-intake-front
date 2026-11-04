import { IntakeFlow } from '@/common/enums/intake-flow.enum'

type StatusCopy = { title: string; description: string }

export type IntakeFlowCopy = {
  depositAccount: StatusCopy
  documents: StatusCopy
  biometrics: StatusCopy
  finished: StatusCopy
}

const FINISHED_TITLE = 'Proposta finalizada com sucesso! 🎉'

const BUYER_DEPOSIT_ACCOUNT = {
  title: 'Dados bancários',
  description:
    'Informe os dados bancários da conta onde deseja receber o pagamento.',
}

const BUYER_BIOMETRICS = {
  title: 'Confirme sua identidade e assine a CCB',
  description:
    'Faça a biometria e a assinatura do contrato. Leva cerca de 5 minutos.',
}

const BUYER_FINISHED = {
  title: FINISHED_TITLE,
  description: 'Você finalizou sua proposta e está tudo certo.',
}

export const intakeFlowCopyRecord: Record<IntakeFlow, IntakeFlowCopy> = {
  [IntakeFlow.BuyerFinancing]: {
    depositAccount: BUYER_DEPOSIT_ACCOUNT,
    documents: {
      title: 'Documentos',
      description: 'Envie documentos legíveis e dentro do prazo de validade.',
    },
    biometrics: BUYER_BIOMETRICS,
    finished: BUYER_FINISHED,
  },
  [IntakeFlow.BuyerLoan]: {
    depositAccount: BUYER_DEPOSIT_ACCOUNT,
    documents: {
      title: 'Documentos pessoais e do veículo',
      description:
        'Agora precisamos que você envie os documentos para formalizar sua proposta.',
    },
    biometrics: BUYER_BIOMETRICS,
    finished: BUYER_FINISHED,
  },
  [IntakeFlow.Seller]: {
    depositAccount: {
      title: 'Dados bancários',
      description:
        'Informe os dados bancários da conta onde o pagamento será realizado.',
    },
    documents: {
      title: 'Documentos pessoais e do veículo',
      description:
        'Agora precisamos que você envie os documentos para formalizar a proposta.',
    },
    biometrics: {
      title: 'Confirme sua identidade',
      description:
        'Para garantir a segurança da sua venda, precisamos confirmar a sua identidade. Leva cerca de 5 minutos.',
    },
    finished: {
      title: FINISHED_TITLE,
      description: 'Você finalizou a proposta e está tudo certo.',
    },
  },
}
