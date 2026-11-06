// `order.status` do `GET intake/start`. Os fechados (recusado, cancelado e
// concluído) fazem o start responder 410.
export enum IntakeOrderStatus {
  // Antes da análise
  SaleNotStarted = 'SaleNotStarted',
  WaitingRegistration = 'WaitingRegistration',
  PendingAuthorization = 'PendingAuthorization',
  // Análise
  Analysing = 'Analysing',
  // Aprovado
  Approved = 'Approved',
  PendingPayment = 'PendingPayment',
  // Pagamento recusado (pode tentar de novo)
  PaymentRefused = 'PaymentRefused',
  // Compra disparada no intake
  PendingPaymentConfirmation = 'PendingPaymentConfirmation',
  // Recusado
  NotAuthorized = 'NotAuthorized',
  UnavailableBalance = 'UnavailableBalance',
  AnalysisExpired = 'AnalysisExpired',
  BiometryRefused = 'BiometryRefused',
  // Cancelado
  Canceled = 'Canceled',
  // Concluído
  Purchased = 'Purchased',
  Billing = 'Billing',
  Done = 'Done',
  Frozen = 'Frozen',
  Disbursed = 'Disbursed',
}
