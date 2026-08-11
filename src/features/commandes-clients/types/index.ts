import type { EtatCommande } from '@/core/types'

export interface LigneCommandeClientRequest {
  articleId: number
  quantite: number
}

export interface CommandeClientRequest {
  codeCommande?: string | null
  dateCommande: string // format ISO "YYYY-MM-DD"
  idClient: number
  lignes: LigneCommandeClientRequest[]
}

export interface LigneCommandeClientResponse {
  id: number
  articleId: number
  articleDesignation: string
  quantite: number
  prixUnitaireHt: number
  prixUnitaireTtc: number
}

export interface CommandeClientResponse {
  id: number
  codeCommande: string
  dateCommande: string
  etatCommande: EtatCommande
  idClient: number
  clientNom: string
  clientPrenom: string
  totalHt: number
  totalTva: number
  totalTtc: number
  lignes: LigneCommandeClientResponse[]
}
