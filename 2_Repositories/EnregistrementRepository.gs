class EnregistrementRepository {

  // Nom de l'onglet source dans la feuille Google Sheet 
  static get NOM_ONGLET() {
    return "Enregistrements";
  }

static _getSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.NOM_ONGLET);
    if (!sheet) {
      throw new Error(`Onglet '${this.NOM_ONGLET}' introuvable dans la feuille Google Sheets.`);
    }
    return sheet;
  }

  // Méthode privée pour fabriquer l'objet
static _mapToModel(ligne, entetes) {
  try {
    const obj = {};
    entetes.forEach((cle, i) => {
      obj[cle] = ligne[i];
    });
    return new Enregistrement(obj);
  } catch (erreur) {
    LogService.logErreur("[Avertissement] Enregistrement ignoré en raison d'une donnée invalide",erreur.message);
    return null; // Retourne null en cas de ligne corrompue
  }
}

  static getAll() {
    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];

    // Récupère lignes des donnees avec un id non vide
    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
    }
    let donnees = tab.slice(1).filter(ligne => ligne[indexId] !== "" && ligne[indexId] !== null);

    // Renvoie un tableau d'objet enregistrement
    return donnees.map(ligne => this._mapToModel(ligne, entetes)).filter(item => item !== null);
  }


  static getById(id) {
    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return null;
    const entetes = tab[0];

    // Récupère lignes des donnees avec un id non vide
    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
    }
    let donnees = tab.slice(1).find(ligne => ligne[indexId] == id);

    if (!donnees) return null;
    return this._mapToModel(donnees, entetes)
  }

  static creerEnregistrement(enregistrement) {
    let tab = this._getSheet();
    const data = tab.getDataRange().getValues();
    const entetes = data[0];
    //Récupere dernière ligne sans id de l'onglet Enregistrements
    let derniereLigne = trouver_derniere_ligne_(this.NOM_ONGLET);

    const enregistrementTable = enregistrement.toArray(entetes);
    let plage = tab.getRange(derniereLigne + 1, 1, 1, enregistrementTable.length);
    // Écrit les valeurs dans la plage définie
    plage.setValues([enregistrementTable]);
  }


  static modifierEnregistrement(enregistrement) {
    let tab = this._getSheet();
    const data = tab.getDataRange().getValues();
    const entetes = data[0];
    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
    }

    //Récupere index de ligne avec cet id de l'onglet Enregistrements
    const indexLigne = data.findIndex(ligne => String(ligne[indexId]).trim() === String(enregistrement.id).trim());

    // Si l'enregistrement n'est pas trouvé dans la feuille
    if (indexLigne === -1) {
      throw new Error(`Aucun enregistrement trouvé avec l'ID : ${enregistrement.id}`);
    }

    const enregistrementTable = enregistrement.toArray(entetes);
    let plage = tab.getRange(indexLigne + 1, 1, 1, enregistrementTable.length);
    // Écrit les valeurs dans la plage définie
    plage.setValues([enregistrementTable]);
  }


  static supprimerEnregistrement(id) {
    let tab = this._getSheet();
    const data = tab.getDataRange().getValues();
    const entetes = data[0];

    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
    }

    //Récupere dernière ligne sans id de l'onglet Enregistrements
    const indexLigne = data.findIndex(ligne => String(ligne[indexId]).trim() === String(id).trim());

    // Si l'enregistrement n'est pas trouvé dans la feuille
    if (indexLigne === -1) {
      throw new Error(`Aucun enregistrement trouvé avec l'ID : ${id}`);
    }
    tab.deleteRow(indexLigne + 1);
  }


  // Récupère les enregistrement du jour n'ayant ni le statut départ ou déchroché ni une heure de départ
  static getAllAffichage() {

    const aujourdHui = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];

    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
    }
    const indexDate = entetes.indexOf("date");
    if (indexDate === -1) {
      throw new Error("Erreur : La colonne 'date' n'a pas été trouvée dans les en-têtes.");
    }
    const indexStatut = entetes.indexOf("statut");
    if (indexStatut === -1) {
      throw new Error("Erreur : La colonne 'statut' n'a pas été trouvée dans les en-têtes.");
    }
    const indexHeureDepart = entetes.indexOf("heure_depart");
    if (indexHeureDepart === -1) {
      throw new Error("Erreur : La colonne 'heure_depart' n'a pas été trouvée dans les en-têtes.");
    }

    // Récupère lignes des donnees 
    let donnees = tab.slice(1).filter(ligne => {

      const idLigne = ligne[indexId];
      const dateLigne = ligne[indexDate];
      const statutLigne = ligne[indexStatut];
      const heureDepartLigne = ligne[indexHeureDepart];

      if (!idLigne) {
        return false;
      }

      const dateObj = new Date(dateLigne);
      if (isNaN(dateObj.getTime())) {
        return false;
      }

      const dateLigneFormate = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");

      if (dateLigneFormate !== aujourdHui) {
        return false;
      }
      if (statutLigne === "Départ" || statutLigne === "Décroché" || statutLigne === "En parking") {
        return false;
      }
      if (heureDepartLigne) {
        return false;
      }
      return true;
    });

    // Renvoie un tableau d'objet enregistrement
    return donnees.map(ligne => this._mapToModel(ligne, entetes)).filter(item => item !== null);
  }

  // Récupère les enregistrement du par date
  static getAllbyDate(debut = new Date(), fin = new Date()) {

    // 1. Conversion OBLIGATOIRE des chaînes String en objets Date
    const dDebut = (debut instanceof Date) ? debut : new Date(debut);
    const dFin = (fin instanceof Date) ? fin : new Date(fin);

    const dateDebut = Utilities.formatDate(dDebut, Session.getScriptTimeZone(), "yyyy-MM-dd");
    const dateFin = Utilities.formatDate(dFin, Session.getScriptTimeZone(), "yyyy-MM-dd");
    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];

    const indexId = entetes.indexOf("id");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'id' n'a pas été trouvée dans les en-têtes.");
    }
    const indexDate = entetes.indexOf("date");
    if (indexDate === -1) {
      throw new Error("Erreur : La colonne 'date' n'a pas été trouvée dans les en-têtes.");
    }
    // Récupère lignes des donnees 
    let donnees = tab.slice(1).filter(ligne => {

      const idLigne = ligne[indexId];
      let dateLigne = ligne[indexDate];
      dateLigne = (dateLigne instanceof Date) ? dateLigne : new Date(dateLigne);
      if (isNaN(dateLigne.getTime())) return false;
      dateLigne = Utilities.formatDate(dateLigne, Session.getScriptTimeZone(), "yyyy-MM-dd");
      if (!idLigne) {
        return false;
      }
      if (dateLigne < dateDebut || dateLigne > dateFin) {
        return false;
      }

      return true;
    });

    // Renvoie un tableau d'objet enregistrement
    return donnees.map(ligne => this._mapToModel(ligne, entetes)).filter(item => item !== null);
  }

  static extraireEtPurgerAnciens(dateLimite) {
    const sheet = this._getSheet();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return { lignes: [], ids: [] };

    const entetes = values[0];
    const indexDate = entetes.indexOf("date");
    const indexId = entetes.indexOf("id");

    const lignesAArchiver = [];
    const idsArchived = [];

    // Parcours du bas vers le haut
    for (let i = values.length - 1; i >= 1; i--) {
      const ligne = values[i];
      let dateLigne = ligne[indexDate] ? new Date(ligne[indexDate]) : null;

      if (dateLigne && !isNaN(dateLigne.getTime()) && dateLigne < dateLimite) {
        lignesAArchiver.push(ligne);
        idsArchived.push(String(ligne[indexId]));
        sheet.deleteRow(i + 1); // Suppression physiquement dans la feuille
      }
    }

    return {
      lignes: lignesAArchiver.reverse(),
      ids: idsArchived
    };
  }


}
