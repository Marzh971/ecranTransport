function apiGenererLavage(donnees) {
  try {
    if (!SecurityService.estPasLecteur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    LavageService.ajouterEncaissementLavage(donnees);

    // Mettre à jour l'enregistrement si un ID est fourni
    if (donnees.idEnregistrement) {
      LavageService.modifierLavagePaye(donnees.idEnregistrement, true);
    }

    let pageHtml = LavageService.obtenirHTMLFacture(donnees);
    return {
      success: true,
      html: pageHtml
    }

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiGenererLavage", erreur.message);
    return {
      success: false,
      message: "Erreur :" + erreur,
    };
  }
}