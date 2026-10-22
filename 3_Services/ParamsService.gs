class ParamsService {

  static getParamsForm() {
    return {
      transporteurs: ParamsRepository.getTransporteurs().sort(),
      clients: ParamsRepository.getClients().sort(),
      statuts: ParamsRepository.getStatuts(),
      anomalies: ParamsRepository.getAnomalies().sort()
    }
  }

  static ajouterDonnees(nomColonne, valeurDonnee) {
    ParamsRepository.ajouterDonnees(nomColonne, valeurDonnee);
  }

  static getTransporteurs() {
    return ParamsRepository.getTransporteurs();
  }

  static getClients() {
    return ParamsRepository.getClients();
  }

}
