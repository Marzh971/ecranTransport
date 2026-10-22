class UtilisateurRepository {

  // Nom de l'onglet source dans la feuille Google Sheet 
  static get NOM_ONGLET() {
    return "Utilisateurs";
  }

static _getSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.NOM_ONGLET);
    if (!sheet) {
      throw new Error(`Onglet '${this.NOM_ONGLET}' introuvable dans la feuille Google Sheets.`);
    }
    return sheet;
  }

  static getUtilisateurParEmail(email) {
    // Si email null retourne null
    if (!email) return null;
    let tab = this._getSheet().getDataRange().getValues();

    // Si tableau vide retourne null
    if (tab.length <= 1) return [];
    const entetes = tab[0];
    // Récupère lignes des donnees avec un id non vide
    let donnes = tab.slice(1).filter(ligne => ligne[0] !== "" && ligne[0] !== null);

    const indexEmail = entetes.indexOf("email");
    // Sécurité si la colonne 'email' n'existe pas dans la feuille
    if (indexEmail === -1) {
      console.log("Erreur : La colonne 'email' n'a pas été trouvée dans les en-têtes.");
      return null;
    }


    // Récupère la ligne de l'utilisateur avec email correspondant
    let ligneUtilisateur = donnes.find(ligne => ligne[indexEmail].toLowerCase() == email.toLowerCase());

    // Si email non trouvé retourne null
    if (!ligneUtilisateur) return null;

    // Construit l'objet JS simple avec les en-têtes du Sheet comme clés
    const obj = {};
    entetes.forEach((cle, i) => {
      obj[cle] = ligneUtilisateur[i];
    });
    // Renvoie l'objet simple
    return obj;
  }

}