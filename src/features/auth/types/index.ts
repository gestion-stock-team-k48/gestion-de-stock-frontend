export interface RegisterRequest {
  nomEntreprise: string
  description?: string
  rue?: string
  ville?: string
  codePostal?: string
  pays?: string
  codeFiscal: string
  email: string
  numTel?: string
  siteWeb?: string
  nomAdmin: string
  prenomAdmin: string
  emailAdmin: string
  motDePasse: string
  dateDeNaissance?: string
  rueAdmin?: string
  villeAdmin?: string
  codePostalAdmin?: string
  paysAdmin?: string
}

export interface AuthenticationRequest {
  email: string
  motDePasse: string
}

/** Swagger: ne contient que token + refreshToken */
export interface AuthenticationResponse {
  token: string
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}
