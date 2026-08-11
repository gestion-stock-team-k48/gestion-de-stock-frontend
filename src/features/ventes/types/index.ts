export interface LigneVenteRequest {
  articleId: number
  quantite: number
}

export interface VenteRequest {
  code?: string | null
  commentaire?: string | null
  lignes: LigneVenteRequest[]
}

export interface LigneVenteResponse {
  id: number
  articleId: number
  articleDesignation: string
  quantite: number
  prixUnitaire: number
}

export interface VenteResponse {
  id: number
  code: string
  dateVente: string
  commentaire: string | null
  idEntreprise: number
  lignes: LigneVenteResponse[]
}
