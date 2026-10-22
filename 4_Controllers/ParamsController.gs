/**
 * Fonction API exposée au Front-End
 * @returns {Object[]} Tableau d'enregistrements au format JSON
 */
function apiGetAllParams() {
  try {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    return ParamsService.getParamsForm();

  } catch (erreur) {
    LogService.logErreur("apiGetAllParams", erreur.message);
    console.log(erreur);
    return {
      success: false,
      message: erreur.message || "Impossible de charger les params.",
    };
  }
}