class BarreArrimageRepository{

  static _getSheetArrimage() {
    const sheet = SpreadsheetApp.openById("1n6ig6EdSm1T1nCvMKRYJBBz5vUmkwIBd");
    if (!sheet) {
      throw new Error(`Le sheet concernant les barres d'arrimages est introuvable`);
    }
    return sheet;
  }


  static getEmail(nomTransporteur){
    const pageBDD = this._getSheetArrimage().getSheetByName("BDD transporteur");
    
    if (!pageBDD) return [];
    let enregistrements = pageBDD.getDataRange().getValues();
    if (enregistrements.length <= 1) return [];
    const entetes = enregistrements[0];
    const indexTransporteur = entetes.indexOf("TRANSPORTEUR");
    const indexMail = entetes.indexOf("MAIL");

    // Sécurité si les colonnes n'existent pas dans la feuille
    if (indexTransporteur === -1 || indexMail === -1) return [];
    const donnee = enregistrements.find( e => String(e[indexTransporteur] || "").toLowerCase().trim() == nomTransporteur.toLowerCase().trim());
    if (!donnee || !donnee[indexMail]) return [];

    let listeMail = String(donnee[indexMail]);
    return listeMail
      .split(/[,;\s]+/)                       // Sépare sur virgule, point-virgule ou espace(s)
      .map(email => email.trim()) // Enlève les espaces inutiles et passe en minuscules
      .filter(email => email.includes("@")) // Conserve uniquement les formats d'e-mails valides
    ;  
  }


  static ajouterVente(donnees){
    const pageVente = this._getSheetArrimage().getSheetByName("Enregistrements");
    if (!pageVente) return ;

    // Mappage dynamique selon les entêtes de la ligne 1
    const entetes = pageVente.getRange(1, 1, 1, pageVente.getLastColumn()).getValues()[0];
    const ligneAInserer = entetes.map(entete =>
      donnees[entete] !== undefined ? donnees[entete] : ""
    );

    // Insertion des données brutes
    pageVente.appendRow(ligneAInserer)

    // Copie des formats et listes déroulantes de la ligne précédente
    const nouvelleLigneIndex = pageVente.getLastRow();
    const lignePrecedenteIndex = nouvelleLigneIndex - 1;
    const nbColonnes = entetes.length;

    if (lignePrecedenteIndex >= 2) {
      const plageSource = pageVente.getRange(lignePrecedenteIndex, 1, 1, nbColonnes);
      const plageCible = pageVente.getRange(nouvelleLigneIndex, 1, 1, nbColonnes);

      plageSource.copyTo(plageCible, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      plageSource.copyTo(plageCible, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    }
  }


}