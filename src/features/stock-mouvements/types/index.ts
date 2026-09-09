import type { SourceMvtStk, TypeMvtStk, AuditFields } from '../../../core/types/index'

export interface MvtStkRequest {
  articleId: number
  quantite: number
  sourceMvt: SourceMvtStk
}

export interface MvtStkCorrectionRequest {
  articleId: number
  quantite: number
  motif: string
}

export interface MvtStkResponse extends AuditFields {
  id: number
  dateMvt: string
  quantite: number
  articleId: number
  articleDesignation: string
  typeMvt: TypeMvtStk
  sourceMvt: SourceMvtStk
  motif: string | null
  idEntreprise: number
}

export interface AlerteStockResponse {
  articleId: number
  code: string
  designation: string
  quantiteStock: number
  seuilMinimum: number
}
