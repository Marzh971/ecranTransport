class ParamsRepository {

  // Nom de l'onglet source dans la feuille Google Sheet 
  static get NOM_ONGLET() {
    return "Params";
  }

  // Récupére la page sheet Enregistrements
  static _getSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.NOM_ONGLET);
    if (!sheet) {
      throw new Error(`Onglet '${this.NOM_ONGLET}' introuvable dans la feuille Google Sheets.`);
    }
    return sheet;
  }

  static getColonne(nomColonne) {
    const sheet = this._getSheet();
    const derniereLigne = sheet.getLastRow();

    // Si la feuille n'a qu'une ligne (seulement les entêtes) ou est vide
    if (derniereLigne <= 1) return [];

    // Récupération de la première ligne (entêtes)
    const entetes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const indexColonne = entetes.indexOf(nomColonne);

    // Si le nom de colonne recherché n'existe pas
    if (indexColonne === -1) {
      throw new Error(`Colonne "${nomColonne}" introuvable dans ${this.NOM_ONGLET}`);
      return [];
    }

    // Récupération des données sous l'entête
    const rawValues = sheet.getRange(2, indexColonne + 1, derniereLigne - 1, 1).getValues();

    // Transformation en tableau 1D, nettoyage des vides et déduplication
    const valeursNettoyees = rawValues
      .map(row => String(row[0]).trim())
      .filter(valeur => valeur !== "");

    return [...new Set(valeursNettoyees)];
  }

  // Méthodes d'accès directes pour les contrôles
  static getTransporteurs() { return this.getColonne("Transporteur"); }
  static getClients() { return this.getColonne("Client"); }
  static getStatuts() { return this.getColonne("Statut Camion"); }
  static getAnomalies() { return this.getColonne("Type d'anomalie"); }


  static ajouterDonnees(nomColonne, valeurDonnee) {
    const sheet = this._getSheet();
    const derniereLigne = trouver_derniere_ligne_colonne_("Params", nomColonne);
    // Récupération de la première ligne (entêtes)
    const entetes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const indexColonne = entetes.indexOf(nomColonne);

    // Si le nom de colonne recherché n'existe pas
    if (indexColonne === -1) {
      throw new Error(`Colonne "${nomColonne}" introuvable dans ${this.NOM_ONGLET}`);
    }

    sheet.getRange(derniereLigne + 1, indexColonne + 1).setValue(valeurDonnee);

  }

}