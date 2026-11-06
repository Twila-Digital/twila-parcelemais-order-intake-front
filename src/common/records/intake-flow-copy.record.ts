type StatusCopy = { title: string; description: string }

type IntakeFlowStep =
  | 'personalData'
  | 'creditAnalysis'
  | 'creditApproved'
  | 'creditDenied'
  | 'address'
  | 'installments'
  | 'card'
  | 'biometrics'
  | 'finished'
  | 'canceled'

export const intakeFlowCopyRecord: Record<IntakeFlowStep, StatusCopy> = {
  personalData: {
    title: 'Dados pessoais',
    description: 'Com esses dados, fazemos a análise de crédito do seu pedido.',
  },
  creditAnalysis: {
    title: 'Estamos analisando seu crédito',
    description:
      'Assim que tivermos uma resposta, avisamos você pelo WhatsApp. Pode fechar esta página.',
  },
  creditApproved: {
    title: 'Crédito aprovado!',
    description:
      'Agora a loja vai iniciar sua compra. Quando isso acontecer, você recebe uma mensagem no WhatsApp para seguir com a compra.',
  },
  creditDenied: {
    title: 'Tudo certo!',
    description:
      'Não foi possível aprovar seu crédito agora. Fale com a loja para fazer uma nova tentativa.',
  },
  address: {
    title: 'Endereço de cobrança',
    description:
      'Informe o endereço de cobrança. Comece pelo CEP que a gente preenche o resto.',
  },
  installments: {
    title: 'Escolha as parcelas',
    description: 'Escolha em quantas vezes quer pagar.',
  },
  card: {
    title: 'Cadastre seu cartão',
    description:
      'As parcelas da sua compra serão cobradas neste cartão de crédito.',
  },
  biometrics: {
    title: 'Confirme sua identidade',
    description:
      'Para proteger sua compra, vamos tirar uma foto do seu rosto. Leva cerca de 5 minutos.',
  },
  finished: {
    title: 'Pedido concluído 🎉',
    description: 'Seu pedido foi concluído e está tudo certo.',
  },
  canceled: {
    title: 'Pedido cancelado',
    description: 'Fale com a gente pelo WhatsApp se precisar de ajuda.',
  },
}
