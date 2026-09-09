// types
export interface MvtStkRequest {
  articleId: number
  quantite: number
  sourceMvt: 'COMMANDE_CLIENT' | 'COMMANDE_FOURNISSEUR' | 'VENTE' | 'STOCK_INITIAL' | 'CORRECTION_MANUELLE'
}

export interface MvtStkCorrectionRequest {
  articleId: number
  quantite: number
  motif: string
}