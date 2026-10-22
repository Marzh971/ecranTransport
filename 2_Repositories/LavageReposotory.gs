class LavageRepository {

  static _getSheetLavage() {
    const sheet = SpreadsheetApp.openById("1b9NfCSSbXMQKzxAt4kaeEioypfeo2Q1P");
    if (!sheet) {
      throw new Error(`Le sheet concernant le lavage est introuvable`);
    }
    return sheet;
  }

  static ajouterEncaissementLavage(donnees) {
    const pageLavage = this._getSheetLavage().getSheetByName("Encaissement Montfort");

    // Structure des données 
    const nouveauLavage = {
      "Date": donnees.date,
      "Nom du transporteur": donnees.transporteur || "",
      "Tarif": donnees.prix ? `${donnees.prix} €` : "",
      "Moyen de paiement": donnees.moyenPaiement || donnees.typePaiement || "",
      "Numéro de plaque remorque/camion": donnees.immatriculation || "",
      "Nombre de lavage(s)": 1
    };

    // Mappage dynamique selon les entêtes de la ligne 1
    const entetes = pageLavage.getRange(4, 1, 1, pageLavage.getLastColumn()).getValues()[0];
    const ligneAInserer = entetes.map(entete =>
      nouveauLavage[entete] !== undefined ? nouveauLavage[entete] : ""
    );

    // Insertion des données brutes
    pageLavage.appendRow(ligneAInserer);

    // Copie des formats et listes déroulantes de la ligne précédente
    const nouvelleLigneIndex = pageLavage.getLastRow();
    const lignePrecedenteIndex = nouvelleLigneIndex - 1;
    const nbColonnes = entetes.length;

    if (lignePrecedenteIndex >= 5) {
      const plageSource = pageLavage.getRange(lignePrecedenteIndex, 1, 1, nbColonnes);
      const plageCible = pageLavage.getRange(nouvelleLigneIndex, 1, 1, nbColonnes);

      plageSource.copyTo(plageCible, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      plageSource.copyTo(plageCible, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    }
  }




}