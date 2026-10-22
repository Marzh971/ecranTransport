function apiGetAllQuais() {
  try {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    return QuaiService.getAll();

  } catch (erreur) {
    LogService.logErreur("apiGetAllQuais", erreur.message);
    console.log(erreur);
    return {
      success: false,
      message: erreur.message || "Impossible de charger les quais.",
    };
  }
}



function apiGetAllQuaisOperationnels() {
  try {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    return QuaiService.getAllOperationnel();

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiGetAllQuaisOperationnels", erreur.message);
    return {
      success: false,
      message: erreur.message || "Impossible de charger les quais.",
    };
  }
}


function apiModifierEtatQuai(id) {
  try {
    if (!SecurityService.estPasLecteur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    const quaiModifie = QuaiService.modifierEtatQuai(id);

    if (!quaiModifie) {
      throw new Error(`Le quai avec l'ID ${id} n'a pas pu être récupéré ou modifié.`);
    }
    return {
      success: true,
      message: "Quai modifié avec succès.",
      etat: quaiModifie.stateDock
    };

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiModifierEtatQuai", erreur.message);
    return {
      success: false,
      message: "Erreur serveur : " + erreur.message
    };
  }
}
