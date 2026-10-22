class AnomalieRepository {

  // Nom de l'onglet source dans la feuille Google Sheet 
  static get NOM_ONGLET() {
    return "Anomalies";
  }

  // Récupére la page sheet Enregistrements
static _getSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.NOM_ONGLET);
    if (!sheet) {
      throw new Error(`Onglet '${this.NOM_ONGLET}' introuvable dans la feuille Google Sheets.`);
    }
    return sheet;
  }

  static creerAnomalie(anomalie) {
    let tab = this._getSheet();
    //Récupere dernière ligne sans id de l'onglet Enregistrements

    let derniereLigne = trouver_derniere_ligne_(this.NOM_ONGLET);
    const data = tab.getDataRange().getValues();
    const entetes = data[0];

    const anomalieTable = anomalie.toArray(entetes);
    let plage = tab.getRange(derniereLigne + 1, 1, 1, anomalieTable.length);
    // Écrit les valeurs dans la plage définie
    plage.setValues([anomalieTable]);
  }

  static modifierAnomalie(anomalie) {
    let tab = this._getSheet();
    const data = tab.getDataRange().getValues();
    const entetes = data[0];
    const indexId = entetes.indexOf("id");

    if (indexId === -1) {
      console.log("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
      return null;
    }
    //Récupere index de ligne avec cet id 
    const indexLigne = data.findIndex(ligne => String(ligne[indexId]).trim() === String(anomalie.id).trim());

    // Si l'anomalie n'est pas trouvé dans la feuille
    if (indexLigne === -1) {
      throw new Error(`Aucune anomalie trouvé avec l'ID : ${anomalie.id}`);
    }

    const anomalieTable = anomalie.toArray(entetes);
    let plage = tab.getRange(indexLigne + 1, 1, 1, anomalieTable.length);
    plage.setValues([anomalieTable]);
  }

  static supprimerAnomalie(idAnomalie) {
    if (!idAnomalie) return;

    const sheet = this._getSheet();
    const valeurs = sheet.getDataRange().getValues();
    if (valeurs.length <= 1) return;

    const entetes = valeurs[0];
    const indexId = entetes.indexOf("id");

    if (indexId === -1) {
      throw new Error("Colonne 'id' introuvable dans la feuille Anomalies.");
    }

    // Parcours du bas vers le haut pour éviter le décalage des index
    for (let i = valeurs.length - 1; i >= 1; i--) {
      if (String(valeurs[i][indexId]) === String(idAnomalie)) {
        sheet.deleteRow(i + 1);
        break; // ID unique trouvé et supprimé
      }
    }
  }


  // Récupère les anomalies par date
  static getAllbyDate(debut = new Date(), fin = new Date()) {

    const dDebut = (debut instanceof Date) ? debut : new Date(debut);
    const dFin = (fin instanceof Date) ? fin : new Date(fin);

    const dateDebut = Utilities.formatDate(dDebut, Session.getScriptTimeZone(), "yyyy-MM-dd");
    const dateFin = Utilities.formatDate(dFin, Session.getScriptTimeZone(), "yyyy-MM-dd");

    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];

    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      Logger.log("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
      return null;
    }
    const indexDate = entetes.indexOf("horodatage_debut");
    if (indexDate === -1) {
      throw new Error("Erreur : La colonne 'horodatage_debut' n'a pas été trouvée dans les en-têtes.");
    }
    // Récupère lignes des donnees 
    let donnees = tab.slice(1).filter(ligne => {

      const idLigne = ligne[indexId];
      let dateLigne = ligne[indexDate];
      dateLigne = (dateLigne instanceof Date) ? dateLigne : new Date(dateLigne);
      dateLigne = Utilities.formatDate(dateLigne, Session.getScriptTimeZone(), "yyyy-MM-dd");
      if (!idLigne) {
        return false;
      }
      if (dateLigne < dateDebut || dateLigne > dateFin) {
        return false;
      }

      return true;
    });
    // Renvoie un tableau d'objets valides en ignorant les lignes corrompues
    return donnees.reduce((acc, ligne, index) => {
      try {
        const obj = {};
        entetes.forEach((cle, i) => {
          obj[cle] = ligne[i];
        });
        acc.push(new Anomalie(obj));
      } catch (erreur) {
        Logger.log(`[Avertissement] Ligne d'anomalie ignorée en raison d'une donnée invalide : ${erreur.message}`);
      }
      return acc;
    }, []);
  }

  static getAnomaliesParEnregistrement(idEnregistrement) {
    const valeurs = this._getSheet().getDataRange().getValues();
    if (valeurs.length <= 1) return [];

    const entetes = valeurs[0];
    const indexIdEnreg = entetes.indexOf("idEnregistrement");
    const indexIdAno = entetes.indexOf("id");

    return valeurs.slice(1)
      .filter(ligne => String(ligne[indexIdEnreg]) === String(idEnregistrement))
      .map(ligne => String(ligne[indexIdAno]));
  }

  static supprimerToutesAnomaliesParEnregistrement(idEnregistrement) {
    if (!idEnregistrement) return;

    const sheet = this._getSheet();
    const valeurs = sheet.getDataRange().getValues();
    if (valeurs.length <= 1) return;

    const entetes = valeurs[0];
    const indexIdEnreg = entetes.indexOf("idEnregistrement");

    if (indexIdEnreg === -1) return;

    // Parcours du bas vers le haut pour ne pas fausser les index lors du deleteRow
    for (let i = valeurs.length - 1; i >= 1; i--) {
      if (String(valeurs[i][indexIdEnreg]) === String(idEnregistrement)) {
        sheet.deleteRow(i + 1);
      }
    }
  }


  static extraireEtPurgerParEnregistrements(idsEnregistrements = []) {
    if (!idsEnregistrements || idsEnregistrements.length === 0) return [];

    const sheet = this._getSheet();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return [];

    const entetes = values[0];
    const indexIdEnreg = entetes.indexOf("idEnregistrement");

    const lignesAArchiver = [];

    // Parcours du bas vers le haut
    for (let i = values.length - 1; i >= 1; i--) {
      const ligne = values[i];
      const idParent = String(ligne[indexIdEnreg]);

      if (idsEnregistrements.includes(idParent)) {
        lignesAArchiver.push(ligne);
        sheet.deleteRow(i + 1); 
      }
    }

    return lignesAArchiver.reverse();
  }


}