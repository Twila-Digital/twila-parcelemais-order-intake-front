// `transactionStatus` do `GET intake/biometry` (`null` = sessão recém-criada)
export enum IntakeBiometryStatus {
  Created = 'CREATED',
  InReview = 'IN REVIEW',
  Approved = 'APPROVED',
  // Reprovada e reprocessada
  Retried = 'RETRIED',
}
