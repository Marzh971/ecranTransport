/**
 * Fonction API exposée au Front-End
 * @returns {Object[]} Tableau d'enregistrements au format JSON
 */
function apiGetAllEnregistrements() {
  try {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    return EnregistrementService.getAll();

  } catch (erreur) {
    LogService.logErreur("apiGetAllEnregistrements", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la récupération des enregistrements.",
    };
  }
}

function apiGetAllEnregistrementsByDate(dateDebut, dateFin) {
  try {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }

    const dDebut = dateDebut ? new Date(dateDebut) : new Date();
    const dFin = dateFin ? new Date(dateFin) : new Date();

    return {
      success: true,
      enregistrements: EnregistrementService.getAllByDate(dDebut, dFin),
      anomalies: AnomalieService.getAllByDate(dDebut, dFin)
    };
  } catch (erreur) {
    LogService.logErreur("apiGetAllEnregistrementsByDate", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la récupération des données.",
      enregistrements: [],
      anomalies: []
    };
  }
}


/**
 * Crée un nouvel enregistrement depuis le Front
 */
function apiCreerEnregistrement(donneesForm, anomalies = []) {

  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }

  try {
    // Instanciation du modèle 
    const nouvelEnregistrement = new Enregistrement(donneesForm);

    const objetsAnomalies = anomalies.map(a => new Anomalie(a));

    //. Sauvegarde dans le sheet
    const resultat = EnregistrementService.creerEnregistrement(nouvelEnregistrement, objetsAnomalies);

    const anomaliesCrees = [];

    for (const anomalie of objetsAnomalies) {
      anomalie.idEnregistrement = nouvelEnregistrement.id;
      AnomalieService.creerAnomalie(anomalie);

      // Préparation du retour pour le Front
      anomaliesCrees.push(anomalie.toJSON());
    }

    // Retour d'un succès au Front-End avec l'objet créé
    return {
      success: true,
      message: "Enregistrement créé avec succès.",
      idGenere: nouvelEnregistrement.id,
      anomalies: anomaliesCrees,
      nouveauTransporteur: resultat.transporteur,
      nouveauClient: resultat.client
    };

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiCreerEnregistrement", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la création de l'enregistrement."
    };
  }
}


/**
 * Modifier un enregistrement depuis le Front
 */
function apiModifierEnregistrement(donneesForm, anomalies = []) {
  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }

  try {
    //  Instanciation du modèle principal
    const nouvelEnregistrement = new Enregistrement(donneesForm);

    //  PRÉ-VALIDATION des anomalies
    const objetsAnomalies = anomalies.map(a => new Anomalie(a));

    // Validation métier + mise à jour de l'enregistrement principal
    const resultat = EnregistrementService.modifierEnregistrement(nouvelEnregistrement, objetsAnomalies);

    // Extraction des ID conservés venant du formulaire (en excluant les cartes temporaires "temp_")
    const idsConserves = anomalies
      .map(a => String(a.id))
      .filter(id => id && id !== "undefined" && !id.startsWith("temp_"));

    // Nettoyage en BDD via le Service
    AnomalieService.nettoyerAnomaliesSupprimees(nouvelEnregistrement.id, idsConserves);

    // Écriture des anomalies
    const anomaliesModifiees = [];

    for (let i = 0; i < objetsAnomalies.length; i++) {
      const anomalie = objetsAnomalies[i];
      const donneeBrute = anomalies[i]; // Permet de vérifier la présence de l'ID d'origine

      if (donneeBrute.id) {
        // C'était une anomalie existante
        AnomalieService.modifierAnomalie(anomalie);
      } else {
        // C'est une nouvelle anomalie ajoutée lors de la modification
        anomalie.idEnregistrement = nouvelEnregistrement.id;
        AnomalieService.creerAnomalie(anomalie);
      }

      anomaliesModifiees.push(anomalie.toJSON());
    }

    return {
      success: true,
      message: "Enregistrement modifié avec succès.",
      anomalies: anomaliesModifiees,
      nouveauTransporteur: resultat.transporteur,
      nouveauClient: resultat.client
    };

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiModifierEnregistrement", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la modification de l'enregistrement."
    };
  }
}

/**
 * Supprimer un enregistrement depuis le Front
 */
function apiSupprimerEnregistrement(id) {

  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }

  try {

    EnregistrementService.supprimerEnregistrement(id);

    // Retour d'un succès au Front-End 
    return {
      success: true,
      message: "Enregistrement supprimé avec succès.",
    };
  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiSupprimerEnregistrement", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la suppression de l'enregistrement.",
    };
  }
}


/**
 * Fonction API Pour envoyer données affichage FIDS
 */
function apiGetEnregistrementFIDS() {
  try {
    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }

    return EnregistrementService.getAllAffichage();

  } catch (erreur) {
    LogService.logErreur("apiGetEnregistrementFIDS", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la récupération des enregistrements.",
    };
  }
}


function apiModifierEtatFeuilleTemperature(idEnregistrement, etat) {

  try {
    if (!SecurityService.estPasLecteur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }

    EnregistrementService.modifierFeuilleTemperature(idEnregistrement, etat);

    return { success: true };

  } catch (erreur) {
    LogService.logErreur("apiModifierEtatFeuilleTemperature", erreur.message);
    return {
      success: false,
      message: erreur.message || "Échec de la modification de l'état de la feuille température.",
    };
  }

}

