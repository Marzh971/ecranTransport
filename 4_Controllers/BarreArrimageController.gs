function apiGenererVenteArrimage(donnees) {

  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }

  try {
    const resultat = BarreArrimageService.creerMail(donnees);
    return {
      success: true,
      donnees: resultat
    };

  } catch (erreur) {
    LogService.logErreur("apiGenererVenteArrimage", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la vente de barres d'arrimage.",
    };
  }
}

function apiEnvoyerMailArrimage(payload) {
  
  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }
  try {
    return BarreArrimageService.envoyerMail(payload);
  } catch (err) {
    LogService.logErreur("apiEnvoyerMailArrimage", erreur.message);
    return { success: false, error: err.message };
  }
}


