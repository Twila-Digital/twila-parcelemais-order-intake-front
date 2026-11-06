// `order.externalStatus` do `GET intake/start`
export enum IntakeOrderExternalStatus {
  Writing = 'Writing',
  Analysing = 'Analysing',
  Approved = 'Approved',
  Refused = 'Refused',
  Canceled = 'Canceled',
  Pending = 'Pending',
  Finished = 'Finished',
  Checked = 'Checked',
  Released = 'Released',
  Paid = 'Paid',
  Ceded = 'Ceded',
  PendingPayment = 'PendingPayment',
  PaymentSituationWarning = 'PaymentSituationWarning',
  PendingLien = 'PendingLien',
  DomicileLocked = 'DomicileLocked',
}
