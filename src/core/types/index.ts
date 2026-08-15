export type EtatCommande = 'EN_PREPARATION' | 'VALIDEE' | 'LIVREE' | 'ANNULEE'

export type SourceMvtStk =
  | 'COMMANDE_CLIENT'
  | 'COMMANDE_FOURNISSEUR'
  | 'VENTE'
  | 'STOCK_INITIAL'
  | 'CORRECTION_MANUELLE'

export type TypeMvtStk = 'ENTREE' | 'SORTIE' | 'CORRECTION_POS' | 'CORRECTION_NEG'

export type Role = 'ROLE_USER' | 'ROLE_ADMIN'

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  isLast: boolean
}
