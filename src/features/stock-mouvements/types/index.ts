import type { SourceMvtStk, TypeMvtStk } from '../../../core/types/index'

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

export interface MvtStkResponse {
  id: number
  dateMvt: string // format ISO datetime complet, ex: "2026-07-31T23:27:28.849Z"
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
