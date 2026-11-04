export enum IntakeErrorType {
  SessionExpired = 'Intake.SessionExpired',
  TokenPhoneMismatch = 'Intake.TokenPhoneMismatch',
  SellerAlreadyDecided = 'Intake.SellerAlreadyDecided',
  SellerAccountRequired = 'Intake.SellerAccountRequired',
  AccountAlreadyExists = 'Intake.AccountAlreadyExists',
  BiometryNotAvailable = 'Intake.BiometryNotAvailable',
  ProposalNotInNegotiation = 'Intake.ProposalNotInNegotiation',
  CounterProposalAlreadyDecided = 'Intake.CounterProposalAlreadyDecided',
  CounterProposalNotFound = 'Intake.CounterProposalNotFound',
}
