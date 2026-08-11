export interface FournisseurRequest {
  nom: string
  prenom: string
  email: string
  numTel?: string
  rue?: string
  ville?: string
  codePostal?: string
  pays?: string
  photo?: string | null
}

export interface FournisseurResponse {
  id: number
  nom: string
  prenom: string
  email: string
  numTel: string | null
  rue: string | null
  ville: string | null
  codePostal: string | null
  pays: string | null
  photo: string | null
}
