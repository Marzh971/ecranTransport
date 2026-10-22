class TemperatureService {

  static getAll() {
    return TemperatureRepository.getAllTypeFeuilleTemp();
  }


  static genererFeuilleTemp(donnees, idGabarit, type, numSemaine = null) {
    try {
      // 1. Génération du document physique Google Drive
      const reponse = TemperatureRepository.genererDocument(idGabarit, donnees, type, numSemaine);

      if (!reponse || !reponse.url) {
        throw new Error("Aucune URL générée par le repository document.");
      }

      // 2. Sauvegarde de l'URL dans l'enregistrement
      const enregistrementModifie = EnregistrementService.updateUrlDocument(donnees, reponse.url, type);

      LogService.ecrireLog(
        "FICHE_TEMP", 
        `Génération fiche (${type}) - Doc ID : ${reponse.id} - Camion ID : ${donnees.id} - Transporteur : ${donnees.transporteur}`
      );

      return {
        success: true,
        infoFeuille: reponse,
        enregistrement: enregistrementModifie
      };

    } catch (erreur) {
      Logger.log(" Erreur dans genererFeuilleTemp : " + erreur.message);
      throw erreur;
    }
  }

  static supprimerFeuilleTemp(enregistrement, idDocument, urlDocument) {
    try {

      const docJson = EnregistrementService.supprimerUrl(enregistrement.feuille_temperature_url, urlDocument);
      enregistrement.feuille_temperature_url = docJson;
      enregistrement.feuille_temperature_generee = Boolean(docJson && docJson.length > 0);

      TemperatureRepository.supprimerDocument(idDocument, urlDocument);
      EnregistrementService.modifierEnregistrement(enregistrement);

      // LOG MÉTIER (avec l'ID du document supprimé)
      LogService.ecrireLog(
        "FICHE_TEMP", 
        `Suppression fiche - Doc ID : ${idDocument || "Inconnu"} - Camion ID : ${enregistrement.id}`
      );

      return { success: true };

    } catch (erreur) {
      Logger.log(" Erreur : " + erreur.message);
      throw erreur;
    }
  }

  static purgerTousLesDocuments(chaineJsonDocs) {
    if (!chaineJsonDocs) return;

    let docs = [];
    try {
      docs = typeof chaineJsonDocs === "string" ? JSON.parse(chaineJsonDocs) : chaineJsonDocs;
    } catch (e) {
      Logger.log("Erreur parsing JSON lors de la purge : " + e.message);
      return;
    }
    if (!Array.isArray(docs)) return;
    // Utilisation directe du forEach sur tes documents
    docs.forEach(doc => {
      if (doc && doc.url) {
        // Extraction de l'ID Google Drive
        const match = doc.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        // match[0] correspond à ce que la RegEx a trouvé , match[1] correspond parenthèse capturante
        const idDrive = match ? match[1] : null;

        if (idDrive) {
          try {
            TemperatureRepository.supprimerDocument(idDrive);
          } catch (e) {
            Logger.log("Erreur lors de la suppression du fichier Drive " + idDrive + " : " + e.message);
          }
        }
      }
    });
  }


}