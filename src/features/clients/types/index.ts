import type { AuditFields } from '../../../core/types'

export interface ClientRequest {
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

export interface ClientResponse extends AuditFields {
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
