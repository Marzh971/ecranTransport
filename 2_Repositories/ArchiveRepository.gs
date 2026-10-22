class ArchiveRepository {

  // ID du fichier Google Sheet d'archivage (À REMPLACER)
  static get ID_SPREADSHEET_ARCHIVE() {
    return "1AXRD999pDMxnSh9GMcPeun2OWW2Lfvv4TRwS-lUaQPA"; 
  }

  static _getSpreadsheet() {
    const sheet = SpreadsheetApp.openById(this.ID_SPREADSHEET_ARCHIVE);
      if (!sheet) {
      throw new Error(`Le sheet concernant les archivages est introuvable`);
    }
    return sheet;
  }
  
  /**
   * Écrit un tableau de lignes dans un onglet du fichier d'archive
   */
  static ecrireLignes(nomOnglet, lignes) {
    if (!lignes || lignes.length === 0) return;

    const sheetArchive = this._getSpreadsheet();
    let sheetOnglet = sheetArchive.getSheetByName(nomOnglet);

    if (!sheetOnglet) {
      throw new Error("L'onglet "+nomOnglet+" est introuvable dans le fichier archivage.");
    }

    const derniereLigne = sheetOnglet.getLastRow();
    sheetOnglet.getRange(derniereLigne + 1, 1, lignes.length, lignes[0].length).setValues(lignes);
  }


  /**
   * Récupère tous les enregistrements archivés sur une plage de dates
   */
  static getEnregistrementsByDate(debut, fin) {
    const sheet = this._getSpreadsheet().getSheetByName("Enregistrements");
    if (!sheet) return [];

    const tab = sheet.getDataRange().getValues();
    if (tab.length <= 1) return [];

    const entetes = tab[0];
    const indexId = entetes.indexOf("id");
    const indexDate = entetes.indexOf("date");

    if (indexId === -1 || indexDate === -1) {
      Logger.log("Champs 'id' ou 'date' introuvables dans la feuille Archives_Enregistrements.");
      return [];
    }

    const dDebut = Utilities.formatDate(new Date(debut), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const dFin = Utilities.formatDate(new Date(fin), Session.getScriptTimeZone(), "yyyy-MM-dd");

    const lignesFiltrées = tab.slice(1).filter(ligne => {
      const idLigne = ligne[indexId];
      let dateLigne = ligne[indexDate];
      if (!idLigne || !dateLigne) return false;

      dateLigne = (dateLigne instanceof Date) ? dateLigne : new Date(dateLigne);
      if (isNaN(dateLigne.getTime())) return false;

      const dateStr = Utilities.formatDate(dateLigne, Session.getScriptTimeZone(), "yyyy-MM-dd");
      return dateStr >= dDebut && dateStr <= dFin;
    });

    return lignesFiltrées.map(ligne => {
      const obj = {};
      entetes.forEach((cle, i) => {
        obj[cle] = ligne[i];
      });
      return typeof Enregistrement !== "undefined" ? new Enregistrement(obj) : obj;
    });
  }

  /**
   * Récupère toutes les anomalies archivées sur une plage de dates
   */
  static getAnomaliesByDate(debut, fin) {
    const sheet = this._getSpreadsheet().getSheetByName("Anomalies");
    if (!sheet) return [];

    const tab = sheet.getDataRange().getValues();
    if (tab.length <= 1) return [];

    const entetes = tab[0];
    const indexId = entetes.indexOf("id");
    const indexDate = entetes.indexOf("horodatage_debut");

    if (indexId === -1 || indexDate === -1) {
      Logger.log("Champs 'id' ou 'horodatage_debut' introuvables dans la feuille Archives_Anomalies.");
      return [];
    }

    const dDebut = Utilities.formatDate(new Date(debut), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const dFin = Utilities.formatDate(new Date(fin), Session.getScriptTimeZone(), "yyyy-MM-dd");

    const lignesFiltrées = tab.slice(1).filter(ligne => {
      const idLigne = ligne[indexId];
      let dateLigne = ligne[indexDate];
      if (!idLigne || !dateLigne) return false;

      dateLigne = (dateLigne instanceof Date) ? dateLigne : new Date(dateLigne);
      if (isNaN(dateLigne.getTime())) return false;

      const dateStr = Utilities.formatDate(dateLigne, Session.getScriptTimeZone(), "yyyy-MM-dd");
      return dateStr >= dDebut && dateStr <= dFin;
    });

    return lignesFiltrées.map(ligne => {
      const obj = {};
      entetes.forEach((cle, i) => {
        obj[cle] = ligne[i];
      });
      return typeof Anomalie !== "undefined" ? new Anomalie(obj) : obj;
    });
  }

}
