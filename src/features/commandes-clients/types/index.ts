import type { EtatCommande, AuditFields } from '../../../core/types'

export interface LigneCommandeClientRequest {
  articleId: number
  quantite: number
}

export interface CommandeClientRequest {
  codeCommande?: string | null
  dateCommande: string
  idClient: number
  lignes: LigneCommandeClientRequest[]
}

export interface LigneCommandeClientResponse extends AuditFields {
  id: number
  articleId: number
  articleDesignation: string
  quantite: number
  prixUnitaireHt: number
  prixUnitaireTtc: number
}

export interface CommandeClientResponse extends AuditFields {
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
