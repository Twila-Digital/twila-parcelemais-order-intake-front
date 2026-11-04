import { httpClientFactory } from '@/services/factories/http-client-factory'
import { IntakeService } from './intake-service'

export const intakeService = new IntakeService(httpClientFactory('/api/intake'))
