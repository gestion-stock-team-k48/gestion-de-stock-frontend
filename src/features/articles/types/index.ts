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

export interface ArticleResponse {
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
  createdAt?: string
  updatedAt?: string
}
