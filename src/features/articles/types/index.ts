import type { AuditFields } from '../../../core/types'

export interface ArticleRequest {
  code: string
  designation: string
  prixUnitaireHt: number
  tauxTva: number
  prixUnitaireTtc: number
  photo?: string | null
  seuilMinimum: number
  categoryId: number
}

export interface ArticleResponse extends AuditFields {
  id: number
  code: string
  designation: string
  prixUnitaireHt: number
  tauxTva: number
  prixUnitaireTtc: number
  photo: string | null
  seuilMinimum: number
  categoryId: number
  categoryDesignation: string
}
