import type { AuditFields } from '../../../core/types'

export interface CategoryRequest {
  code: string
  designation: string
}

export interface CategoryResponse extends AuditFields {
  id: number
  code: string
  designation: string
}
