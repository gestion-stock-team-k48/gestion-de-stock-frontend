import type { AuditFields } from '../../../core/types'

export interface LigneVenteRequest {
  articleId: number
  quantite: number
}

export interface VenteRequest {
  code?: string | null
  dateVente?: string | null
  commentaire?: string | null
  lignes: LigneVenteRequest[]
}

export interface LigneVenteResponse extends AuditFields {
  id: number
  articleId: number
  articleDesignation: string
  quantite: number
  prixUnitaire: number
}

export interface VenteResponse extends AuditFields {
  id: number
  code: string
  dateVente: string
  commentaire: string | null
  idEntreprise: number
  lignes: LigneVenteResponse[]
}
