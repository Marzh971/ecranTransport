function apiGetTraductions() {

  try {

    if (!SecurityService.verifUtilisateur()) {
      throw new Error("Accès refusé : Action non autorisée.");
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const page = sheet.getSheetByName("Traductions");

    if (!page) {
      console.log("Onglet 'Traductions' introuvable.");
      return;
    }

    const donnees = page.getDataRange().getValues();
    if (donnees.length <= 1) {
      return []; // Onglet vide ou seulement les en-têtes
    }

    const entetes = donnees[0];

    // Mapping propre ligne par ligne
    return donnees.map(ligne => {
      let obj = {};
      entetes.forEach((header, index) => {
        if (header) obj[header] = ligne[index];
      });
      return obj;
    });

  } catch (erreur) {
    console.log(erreur);
    LogService.logErreur("apiGetTraductions", erreur.message);
    return {
      success: false,
      message: "Erreur serveur : " + erreur.message
    };
  }
}