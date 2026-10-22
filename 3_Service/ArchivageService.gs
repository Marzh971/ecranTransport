class ArchivageService {

  /**
   * Orchestre l'archivage en cascade de l'application
   */
  static executerArchivageAuto() {
    // 1. Définition de la règle métier : 14 mois
    const dateLimite = new Date();
    dateLimite.setMonth(dateLimite.getMonth() - 14);

    // 2. Extraction et purge des enregistrements anciens dans le fichier principal
    const resultEnreg = EnregistrementRepository.extraireEtPurgerAnciens(dateLimite);

    if (resultEnreg.lignes.length === 0) {
      Logger.log("Aucun enregistrement de plus de 14 mois à archiver.");
      return;
    }

    // 3. Écriture des enregistrements dans le fichier d'archive
    ArchiveRepository.ecrireLignes("Enregistrements", resultEnreg.lignes);

    // 4. Extraction et purge des anomalies liées à ces enregistrements archivés
    const lignesAnomalies = AnomalieRepository.extraireEtPurgerParEnregistrements(resultEnreg.ids);

    // 5. Écriture des anomalies dans le fichier d'archive
    if (lignesAnomalies.length > 0) {
      ArchiveRepository.ecrireLignes("Anomalies", lignesAnomalies);
    }

    Logger.log(`Archivage réussi : ${resultEnreg.lignes.length} enregistrement(s) et ${lignesAnomalies.length} anomalie(s) archivé(s).`);
  }

  /**
   * Récupère les enregistrements et anomalies archivés filtrés par date
   * @param {string|Date} dateDebut 
   * @param {string|Date} dateFin 
   * @returns {Object} { enregistrements: Array, anomalies: Array }
   */
  static getAllByDate(dateDebut, dateFin) {
    if (!dateDebut || !dateFin) {
      return { enregistrements: [], anomalies: [] };
    }

    // 1. Appel du repository pour récupérer les entités archivées
    const enregistrementsEntities = ArchiveRepository.getEnregistrementsByDate(dateDebut, dateFin);
    const anomaliesEntities = ArchiveRepository.getAnomaliesByDate(dateDebut, dateFin);

    // 2. Conversion des entités/modèles en JSON (comme dans tes autres services)
    const enregistrementsJson = enregistrementsEntities.map(item => 
      (typeof item.toJSON === "function") ? item.toJSON() : item
    );

    const anomaliesJson = anomaliesEntities.map(item => 
      (typeof item.toJSON === "function") ? item.toJSON() : item
    );

    return {
      enregistrements: enregistrementsJson,
      anomalies: anomaliesJson
    };
  }



}