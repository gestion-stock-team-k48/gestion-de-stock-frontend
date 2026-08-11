import type { EtatCommande } from '../../../core/types/index'

export interface LigneCommandeFournisseurRequest {
  articleId: number
  quantite: number
}

export interface CommandeFournisseurRequest {
  codeCommande?: string | null
  dateCommande: string
  idFournisseur: number
  lignes: LigneCommandeFournisseurRequest[]
}

export interface LigneCommandeFournisseurResponse {
  id: number
  articleId: number
  articleDesignation: string
  quantite: number
  prixUnitaireHt: number
  prixUnitaireTtc: number
}

export interface CommandeFournisseurResponse {
  id: number
  codeCommande: string
  dateCommande: string
  etatCommande: EtatCommande
  idFournisseur: number
  fournisseurNom: string
  fournisseurPrenom: string
  totalHt: number
  totalTva: number
  totalTtc: number
  lignes: LigneCommandeFournisseurResponse[]
}
