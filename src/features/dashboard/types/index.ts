export interface TopArticleVenduResponse {
  articleId: number
  designation: string
  quantiteVendue: number
}

export interface DashboardStatsResponse {
  chiffreAffairesTotal: number
  chiffreAffairesMoisCourant: number
  commandesClientEnCours: number
  commandesClientLivrees: number
  commandesFournisseurEnCours: number
  commandesFournisseurLivrees: number
  topArticlesVendus: TopArticleVenduResponse[]
}