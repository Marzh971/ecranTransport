class TemperatureRepository {

  // Nom de l'onglet source dans la feuille Google Sheet 
  static get NOM_ONGLET() {
    return "Gabarits_Temp";
  }

  // Récupére la page sheet Utilisateurs
static _getSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.NOM_ONGLET);
    if (!sheet) {
      throw new Error(`Onglet '${this.NOM_ONGLET}' introuvable dans la feuille Google Sheets.`);
    }
    return sheet;
  }

  static getAllTypeFeuilleTemp() {

    let tab = this._getSheet().getDataRange().getValues();
    if (tab.length <= 1) return [];
    const entetes = tab[0];

    const indexId = entetes.indexOf("idGabarit");
    const indexType = entetes.indexOf("type");
    if (indexType === -1 || indexId === -1) {
      throw new Error("Erreur : La colonne 'idGabarit et/ou 'type' n'a pas été trouvée.");
    }

    let donnes = tab.slice(1).filter(ligne => ligne[indexId] !== "" && ligne[indexId] !== null);

    return donnes.map(ligne => {
      const obj = {};
      entetes.forEach((cle, i) => {
        obj[cle] = ligne[i];
      });
      return obj;
    });
  }


  static genererDocument(idGabarit, donnees, type = null , numSemaine = null) {

    // Récupération du dossier parent
    let dossierParent = DriveApp.getFolderById("1CwOOYn3AhKCuEfACDq7V8hZ5VLgD7Aqg");

    // Récupération et formatage de la date (YYYY-MM-DD)
    const d = donnees.date ? new Date(donnees.date) : new Date();
    const dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");

    // Construction du dossier
    const nomDossier = `${dateStr}_${assainirNom_(donnees.transporteur)}_${assainirNom_(donnees.client)}`;
    const dossier = obtenirOuCreerDossier_(nomDossier, dossierParent);

    // Construction du nom du fichier
    const typeStr = assainirNom_(type);
    const nomFichier = `${typeStr}_${nomDossier}`;

    // Duplication du fichier
    const fichierGabarit = DriveApp.getFileById(idGabarit);
    let copieFichier = fichierGabarit.makeCopy(nomFichier, dossier);

    // Ouverture du document copié pour remplacer le texte
    const docCopie = DocumentApp.openById(copieFichier.getId());
    const body = docCopie.getBody();

    const donneesInsertion = {
      "{{date}}": Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy"),
      "{{transporteur}}": donnees.transporteur || "",
      "{{immatriculation}}": donnees.immatriculation || "",
      "{{quai}}": donnees.quai || "",
      "{{numSemaine}}": numSemaine || "",
    };

    // Remplacement des balises dans le document
    for (let balise in donneesInsertion) {
      body.replaceText(balise, donneesInsertion[balise]);
    }

    // Sauvegarde et fermeture
    docCopie.saveAndClose();

    // Retour de l'URL et de l'ID du document généré
    return {
      id: copieFichier.getId(),
      url: copieFichier.getUrl(),
      nom: copieFichier.getName(),
    };
  }


  static supprimerDocument(idDocument) {
    let document = DriveApp.getFileById(idDocument);
    if (!document) throw new Error("Document introuvable");

    // Récupérer les dossiers parents
    const dossierParents = document.getParents();
    document.setTrashed(true); // Envoie le document dans la corbeille

    if (dossierParents.hasNext()) {
      let dossier = dossierParents.next();
      let fichiers = dossier.getFiles();
      let sousDossiers = dossier.getFolders();

      // Supprime le dossier si vide
      if (!fichiers.hasNext() && !sousDossiers.hasNext()) {
        dossier.setTrashed(true);
      }

    }
  }





}