/**
 * CONTROLLER : Expose les endpoints pour la vue Indicateurs / KPI
 */
function apiGetDonneesIndicateursAvecArchives(dateDebut, dateFin) {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
  try {
    // Contrôle de surface / Validation des paramètres
    if (!dateDebut || !dateFin) {
      return { success: false, message: "Les dates de début et de fin sont obligatoires." };
    }

    // Délégation au Service
    return IndicateurService.getDonneesKpi(dateDebut, dateFin);

  } catch (erreur) {
    LogService.logErreur("apiGetDonneesIndicateursAvecArchives", erreur.message);
    return { success: false, message: "Erreur lors du traitement des indicateurs." };
  }
}