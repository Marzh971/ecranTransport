class LavageService {

  static ajouterEncaissementLavage(donnees) {
    LavageRepository.ajouterEncaissementLavage(donnees);
    // LOG MÉTIER : Enregistré au niveau du service
    LogService.ecrireLog(
      "LAVAGE", 
      `Facturation lavage (${donnees.prix}€ - ${donnees.typePaiement}) - Immat : ${donnees.immatriculation} - Transporteur : ${donnees.transporteur}`
    );
  }

  static obtenirHTMLFacture(donnees) {
    const gabarit = HtmlService.createTemplateFromFile('5_Views/factureLavage');
    const date = Utilities.formatDate(new Date(donnees.date), Session.getScriptTimeZone(), "dd/MM/yyyy");
    donnees.date = date;
    gabarit.donnees = donnees;
    return gabarit.evaluate().getContent();
  }


  static modifierLavagePaye(idEnregistrement, etat) {
    if (!idEnregistrement) return;

    const enregistrement = EnregistrementRepository.getById(idEnregistrement);
    if (!enregistrement) return;

    enregistrement.lavage_paye = Boolean(etat);
    EnregistrementRepository.modifierEnregistrement(enregistrement);
  }

}
