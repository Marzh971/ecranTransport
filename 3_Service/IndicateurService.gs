class IndicateurService {

/**
   * Consolide les enregistrements et les anomalies provenant des sources actives et archivées.
   * @param {string|Date} dateDebut 
   * @param {string|Date} dateFin 
   * @returns {Object} Objet contenant les tableaux d'enregistrements et d'anomalies au format JSON
   */
  static getDonneesKpi(dateDebut, dateFin) {
    // 1. Récupération des données actives via les Services / Repositories existants
    const enregistrementsActifs = EnregistrementService.getAllByDate(dateDebut, dateFin); // Renvoie déjà des objets JSON[cite: 10]
    const anomaliesActives = AnomalieService.getAllByDate(dateDebut, dateFin);             // Renvoie déjà des objets JSON

    // 2. Récupération des données archivées (via ton service/repository d'archives)
    let enregistrementsArchives = [];
    let anomaliesArchivees = [];

    if (typeof ArchivageService !== "undefined" && typeof ArchivageService.getAllByDate === "function") {
      const archives = ArchivageService.getAllByDate(dateDebut, dateFin);
      enregistrementsArchives = archives.enregistrements || [];
      anomaliesArchivees = archives.anomalies || [];
    }

    // 3. Fusion des données actives et archivées
    const enregistrementsTotal = enregistrementsActifs.concat(enregistrementsArchives);
    const anomaliesTotal = anomaliesActives.concat(anomaliesArchivees);

    return {
      success: true,
      enregistrements: enregistrementsTotal,
      anomalies: anomaliesTotal
    };
  }

}
