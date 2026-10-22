function apiGetAllTypeFeuilleTemp() {
  try {
    if (!SecurityService.estPasLecteur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    const listeTemp = TemperatureService.getAll();
    return {
      success: true,
      liste: listeTemp
    }

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiGetAllTypeFeuilleTemp", erreur.message);
    return {
      success: false,
      message: erreur.message || "Impossible de charger les types de fiche température.",
    };
  }
}


function apiGenererFeuilleTemp(donneesForm, idFeuille, typeFeuille, anomalies = [], numSemaine = null) {
  try {

  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }

    // 1. Instanciation des modèles
    const nouvelEnregistrement = new Enregistrement(donneesForm);
    const objetsAnomalies = anomalies.map(a => new Anomalie(a));

    // 2. Génération document + Mise à jour URL dans l'enregistrement
    const resultat = TemperatureService.genererFeuilleTemp(nouvelEnregistrement, idFeuille, typeFeuille,numSemaine);

    // 3. Boucle d'écriture des anomalies
    const anomaliesTraitees = [];

    for (let i = 0; i < objetsAnomalies.length; i++) {
      const anomalie = objetsAnomalies[i];
      const donneeBrute = anomalies[i];

      anomalie.idEnregistrement = nouvelEnregistrement.id;
      anomalie.transporteur = nouvelEnregistrement.transporteur;
      anomalie.client = nouvelEnregistrement.client;

      if (donneeBrute.id && String(donneeBrute.id).trim() !== "" && !String(donneeBrute.id).startsWith("temp_")) {
        // Anomalie existante
        AnomalieService.modifierAnomalie(anomalie);
      } else {
        // Nouvelle anomalie : Génère l'ID proprement via AnomalieService !
        AnomalieService.creerAnomalie(anomalie);
      }

      anomaliesTraitees.push(anomalie.toJSON());
    }

    return {
      success: true,
      message: "Feuille de température générée et anomalies sauvegardées.",
      enregistrement: resultat.enregistrement ? resultat.enregistrement.toJSON() : nouvelEnregistrement.toJSON(),
      anomalies: anomaliesTraitees,
      infoFeuille: resultat.infoFeuille
    };

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiGenererFeuilleTemp", erreur.message);
    return {
      success: false,
      message: "Impossible de générer la fiche : " + erreur.message
    };
  }
}



function apiSupprimerFeuilleTemp(enregistrementDonnee, idDocument, urlDocument) {
  try {
    if (!SecurityService.estPasLecteur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    const enregistrement = new Enregistrement(enregistrementDonnee);

    const resultat = TemperatureService.supprimerFeuilleTemp(enregistrement, idDocument, urlDocument);
    if (resultat && resultat.success) {
      return { success: true, message: "Document supprimé avec succès." };
    }
  } catch (erreur) {
    LogService.logErreur("apiSupprimerFeuilleTemp", erreur.message);
    return { success: false, message: erreur.message };
  }
}