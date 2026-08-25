import type { AuditFields } from '../../../core/types'

export interface EntrepriseRequest {
  nom: string
  description?: string
  rue?: string
  ville?: string
  codePostal?: string
  pays?: string
  codeFiscal: string
  photo?: string | null
  email: string
  numTel?: string
  siteWeb?: string
}

export interface EntrepriseResponse extends AuditFields {
  id: number
  nom: string
  description: string | null
  rue: string | null
  ville: string | null
  codePostal: string | null
  pays: string | null
  codeFiscal: string
  photo: string | null
  email: string
  numTel: string | null
  siteWeb: string | null
}
