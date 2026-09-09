import type { Role, AuditFields } from '../../../core/types/index'

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

/** Requête PUT /utilisateurs/me — champs personnels uniquement (pas de roles, pas d'email) */
export interface UtilisateurMeRequest {
  nom: string
  prenom: string
  dateDeNaissance?: string
  rue?: string
  ville?: string
  codePostal?: string
  pays?: string
}

export interface UtilisateurResponse extends AuditFields {
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
