// Etapas do `dateAndStatus` do `GET intake/start`; o array sempre traz as 6, nesta ordem
export enum IntakeStepStatus {
  UpdateProfile = 'UpdateProfile',
  UpsertAddress = 'UpsertAddress',
  UpdateTerm = 'UpdateTerm',
  PaymentProfile = 'PaymentProfile',
  Biometry = 'Biometry',
  StartSale = 'StartSale',
}
