export function getApiErrorMessage(error: unknown, fallback: string) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 400) return "Les informations saisies sont invalides. Vérifiez les champs indiqués.";
  if (status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (status === 403) return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
  if (status === 404) return "La donnée demandée est introuvable.";
  if (status === 409) return "Cette donnée existe déjà. Vérifiez les informations saisies.";
  if (status && status >= 500) return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
  return fallback;
}
