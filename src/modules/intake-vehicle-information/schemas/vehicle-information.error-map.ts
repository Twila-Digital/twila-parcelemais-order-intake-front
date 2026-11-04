import type { ApiErrorFieldMap } from '@/services/api-error-handler'
import type { VehicleInformationFormData } from './vehicle-information.schema'

export const vehicleInformationErrorMap: ApiErrorFieldMap<VehicleInformationFormData> =
  {
    'Proposal.ProposalLicensePlateIsRequired': 'plate',
    'Proposal.InvalidLicensePlate': 'plate',
    'Proposal.RenavamIsRequired': 'renavam',
    'Proposal.InvalidRenavam': 'renavam',
    'Proposal.ChassiIsRequired': 'chassi',
    'Proposal.InvalidChassi': 'chassi',
    'Proposal.VehicleColorIsRequired': 'color',
    RegularExpressionValidator: {
      field: 'color',
      message: 'Informe uma cor válida, sem números.',
    },
  }
