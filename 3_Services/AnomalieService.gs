class AnomalieService {

  static getAllByDate(dateDebut, dateFin) {
    const anomalies = AnomalieRepository.getAllbyDate(dateDebut, dateFin);

    // Convertit chaque instance d'anomale en objet littéral
    return anomalies.map(item => item.toJSON());
  }

  static creerAnomalie(anomalie) {

    AnomalieRepository.creerAnomalie(anomalie);
    LogService.ecrireLog(
      "ANOMALIE", 
      `Création anomalie ${anomalie.id}  Type: ${anomalie.type_anomalie} - Enregistrement ID : ${anomalie.idEnregistrement} - Transporteur : ${anomalie.transporteur}`
    );

  }

  static modifierAnomalie(anomalie) {

    const idValide = anomalie.id;

    if (!idValide) {
      throw new Error("id obligatoire")
    }
    AnomalieRepository.modifierAnomalie(anomalie);
    LogService.ecrireLog(
      "ANOMALIE", 
      `Modification anomalie ${anomalie.id}  Type: ${anomalie.type_anomalie} - Enregistrement ID : ${anomalie.idEnregistrement} - Transporteur : ${anomalie.transporteur}`
    );
  }

  static nettoyerAnomaliesSupprimees(idEnregistrement, idsConserves = []) {
    if (!idEnregistrement) return;

    // Récupère tous les ID d'anomalies actuellement stockés en BDD pour cet enregistrement
    const idsEnBDD = AnomalieRepository.getAnomaliesParEnregistrement(idEnregistrement);

    // Détermine quels ID sont en BDD mais n'apparaissent plus dans le formulaire
    const idsASupprimer = idsEnBDD.filter(idBDD => !idsConserves.includes(idBDD));

    // Ordonne au Repository de supprimer chaque anomalie retirée
    idsASupprimer.forEach(id => {
      AnomalieRepository.supprimerAnomalie(id);
    });
  }

  static supprimerAnomaliesParEnregistrement(idEnregistrement) {
    AnomalieRepository.supprimerToutesAnomaliesParEnregistrement(idEnregistrement);
    
    LogService.ecrireLog(
      "ANOMALIE", 
      `Suppression des anomalies de l'enregistrement  ${idEnregistrement}`
    );
  }

}