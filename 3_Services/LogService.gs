class LogService {

  // ID du fichier Google Sheet dédié uniquement aux Logs
  static get ID_SHEET_LOGS() {
    return "1PM6QcwGmv2tTuJrUrrNohafhSeJD8QxMi5IJkoC9pY8"; 
  }

  /**
   * Méthode générique d'écriture dans le journal
   */
  static ecrireLog(typeEvenement, details = "") {
    try {
      const ss = SpreadsheetApp.openById(this.ID_SHEET_LOGS);
      let feuille = ss.getSheetByName("Logs");

      // Création automatique de la feuille et des en-têtes si elle n'existe pas
      if (!feuille) {
        feuille = ss.insertSheet("Logs");
        feuille.appendRow(["Horodatage", "Type Événement", "Détails", "Utilisateur"]);
      }

      const utilisateur = Session.getActiveUser().getEmail() || "Anonyme";
      
      // Ajout de la ligne de log
      feuille.appendRow([new Date(), typeEvenement, details, utilisateur]);

    } catch (erreur) {
      // En cas d'échec d'écriture du log, on ne bloque surtout pas l'application métier
      Logger.log("Échec de l'enregistrement du log : " + erreur.message);
    }
  }

  // --- Raccourcis pratiques ---
  
  static logConnexion(pageVisitee) {
    this.ecrireLog("CONNEXION", "Accès à la page : " + pageVisitee);
  }

  static logEnregistrement(action, idEnregistrement) {
    this.ecrireLog("ENREGISTREMENT", `Action : ${action} sur ID : ${idEnregistrement}`);
  }

  static logErreur(fonctionSource, messageErreur) {
    this.ecrireLog("ERREUR", `[${fonctionSource}] ${messageErreur}`);
  }


}