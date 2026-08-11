import type { Role } from '../../../core/types/index'

export interface UtilisateurRequest {
  nom: string
  prenom: string
  email: string
  dateDeNaissance?: string
  photo?: string | null
  rue?: string
  ville?: string
  codePostal?: string
  pays?: string
  roles: Role[]
}

export interface UtilisateurResponse {
  id: number
  nom: string
  prenom: string
  email: string
  dateDeNaissance: string | null
  photo: string | null
  rue: string | null
  ville: string | null
  codePostal: string | null
  pays: string | null
  entrepriseId: number
  entrepriseNom: string
  roles: Role[]
  mustChangePassword: boolean
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}