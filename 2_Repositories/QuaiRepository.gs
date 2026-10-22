class QuaiRepository {

  // Nom de l'onglet source dans la feuille Google Sheet 
  static get NOM_ONGLET() {
    return "Quais";
  }

static _getSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.NOM_ONGLET);
    if (!sheet) {
      throw new Error(`Onglet '${this.NOM_ONGLET}' introuvable dans la feuille Google Sheets.`);
    }
    return sheet;
  }

  static getAll() {
    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];

    // Récupère lignes des donnees avec un id non vide
    const indexId = entetes.indexOf("idDock");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'idDock' n'a pas été trouvée dans les en-têtes.");
    }

    let donnes = tab.slice(1).filter(ligne => ligne[indexId] !== "" && ligne[indexId] !== null);

    return donnes.reduce((acc, ligne) => {
      try {
        const obj = {};
        entetes.forEach((cle, i) => {
          obj[cle] = ligne[i];
        });
        acc.push(new Quai(obj));
      } catch (erreur) {
        Logger.log(`[Avertissement] Quai ignoré : ${erreur.message}`);
      }
      return acc;
    }, []);
  }

  // Dans getAll() et getAllOperationnel() de QuaiRepository.txt :


  static getAllOperationnel() {
    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];
    // Récupère lignes des donnees avec un id non vide
    const indexId = entetes.indexOf("idDock");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'idDock' n'a pas été trouvée dans les en-têtes.");
      return null;
    }

    let donnes = tab.slice(1).filter(ligne => ligne[indexId] !== "" && ligne[indexId] !== null);

    const indexEtat = entetes.indexOf("stateDock");
    if (indexEtat === -1) {
      throw new Error("Erreur : La colonne 'stateDock' n'a pas été trouvée dans les en-têtes.");
      return null;
    }

    donnes = donnes.filter(ligne => ligne[indexEtat] == "Opérationnel");

    return donnes.reduce((acc, ligne) => {
      try {
        const obj = {};
        entetes.forEach((cle, i) => {
          obj[cle] = ligne[i];
        });
        acc.push(new Quai(obj));
      } catch (erreur) {
        Logger.log(`[Avertissement] Quai ignoré : ${erreur.message}`);
      }
      return acc;
    }, []);
  }


  static getQuai(id) {
    let tab = this._getSheet();
    const data = tab.getDataRange().getValues();
    const entetes = data[0];
    const indexId = entetes.indexOf("idDock");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'idDock' n'a pas été trouvée dans les en-têtes.");
      return null;
    }

    const ligneTrouvee = data.slice(1).find(ligne => String(ligne[indexId]).trim() === String(id).trim());

    if (!ligneTrouvee) return null;

    // Conversion de la ligne en objet Key/Value
    const obj = {};
    entetes.forEach((cle, i) => {
      obj[cle] = ligneTrouvee[i];
    });

    // Retourne la nouvelle instance de Quai
    return new Quai(obj);
  }

  static modifierQuai(quai) {
    let tab = this._getSheet();
    const data = tab.getDataRange().getValues();
    const entetes = data[0];
    const indexId = entetes.indexOf("idDock");
    if (indexId === -1) {
      throw new Error("Erreur : La colonne 'idDock' n'a pas été trouvée dans les en-têtes.");
      return null;
    }

    const indexLigne = data.findIndex(ligne => String(ligne[indexId]).trim() === String(quai.idDock).trim());

    if (indexLigne === -1) {
      throw new Error(`Aucun quai trouvé avec l'ID : ${quai.idDock}`);
    }

    const quaiTable = quai.toArray(entetes);
    let plage = tab.getRange(indexLigne + 1, 1, 1, quaiTable.length);
    // Écrit les valeurs dans la plage définie
    plage.setValues([quaiTable]);


    return quai;
  }





}