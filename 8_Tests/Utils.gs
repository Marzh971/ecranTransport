/**
 * Crée un menu personnalisé dans la barre de menus de Google Sheets à l'ouverture du fichier
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ Maintenance Logistique')
    .addItem('Convertir URLs Température -> Format JSON', 'migrerEtFormaterUrlsFeuilleTemp')
    .addToUi();
}


/**
 * Fonction de maintenance / mode dégradé :
 * Parcourt la colonne 'feuille_temperature_url' du Sheet 'Enregistrements'
 * et convertit les URLs brutes au format JSON structuré : [{"type": "Document", "url": "..."}]
 */
function migrerEtFormaterUrlsFeuilleTemp() {
  const NOM_SHEET = "Enregistrements";
  const NOM_COLONNE_URL = "feuille_temperature_url";

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const feuille = ss.getSheetByName(NOM_SHEET);

  if (!feuille) {
    SpreadsheetApp.getUi().alert(`Feuille "${NOM_SHEET}" introuvable.`);
    return;
  }

  const donnees = feuille.getDataRange().getValues();
  if (donnees.length <= 1) return; // Pas de données sous les en-têtes

  const entetes = donnees[0];
  const indexUrl = entetes.indexOf(NOM_COLONNE_URL);

  if (indexUrl === -1) {
    SpreadsheetApp.getUi().alert(`Colonne "${NOM_COLONNE_URL}" introuvable.`);
    return;
  }

  let nbModifications = 0;

  // Parvis des lignes de données (à partir de la ligne 2 / index 1)
  for (let i = 1; i < donnees.length; i++) {
    const valeurBrute = String(donnees[i][indexUrl] || "").trim();

    if (!valeurBrute) continue; // Cellule vide, on passe

    // Vérification si la valeur est DÉJÀ un JSON valide
    let estDejaJson = false;
    try {
      const parsed = JSON.parse(valeurBrute);
      if (Array.isArray(parsed)) {
        estDejaJson = true;
      }
    } catch (e) {
      estDejaJson = false;
    }

    // Si ce n'est pas du JSON mais que ça ressemble à une URL (ou contient http)
    if (!estDejaJson) {
      let nouvelleStructure = [];

      // Si plusieurs URLs brutes sont séparées par des virgules ou des retours à la ligne
      const urlsSeparees = valeurBrute.split(/[\n,]+/);

      urlsSeparees.forEach(urlBrute => {
        const urlNettoyee = urlBrute.trim();
        if (urlNettoyee) {
          nouvelleStructure.push({
            type: "Feuille de température", // Type par défaut réinjecté
            url: urlNettoyee
          });
        }
      });

      if (nouvelleStructure.length > 0) {
        const jsonFormate = JSON.stringify(nouvelleStructure);
        
        // Mise à jour directe de la cellule dans Google Sheets (+1 car les lignes du Sheet commencent à 1)
        feuille.getRange(i + 1, indexUrl + 1).setValue(jsonFormate);
        nbModifications++;
      }
    }
  }

  // Alerte de confirmation
  SpreadsheetApp.getUi().alert(
    `Migration terminée !\n${nbModifications} ligne(s) convertie(s) au format JSON.`
  );
}






/**
 * Script de Seed pour peupler l'onglet "Enregistrements"
 */
function seedEnregistrements_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(EnregistrementRepository.NOM_ONGLET);
  const sheetAnomalies = ss.getSheetByName(AnomalieRepository.NOM_ONGLET);

  if (!sheet || !sheetAnomalies) return;

  // 1. Nettoie les données sous les en-têtes (Ligne 2+)
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  const lastRowAnomalies = sheetAnomalies.getLastRow();
  const lastColAnomalies = sheetAnomalies.getLastColumn();
  if (lastRowAnomalies > 1 && lastColAnomalies > 0) {
    sheetAnomalies.getRange(2, 1, lastRowAnomalies - 1, lastColAnomalies).clearContent();
  }

  // Helpers pour générer des objets Date JS
  const today = new Date();
  const makeTime = (h, m) => new Date(1899, 11, 30, h, m);

  // 2. Jeux de données
  const objetsBase = [
    { id: "cevev", date: new Date("2026-09-22"), transporteur: "Inconnu", client: "fzzf", immatriculation: "vzz", quai: "8", heure_arrivee: makeTime(14, 17), heure_pret_ch: makeTime(15, 45), heure_depart: makeTime(18, 53) },
    { id: "2026_0000324", date: today, transporteur: "Seafrigo", immatriculation: "ok", client: "Andriopouloi", quai: "4", statut: "À Quai", heure_arrivee: makeTime(6, 15) },
    { id: "2026_0000329", date: today, transporteur: "test", client: "Non spécifié", immatriculation: "fzzf" },
    { id: "2026_0000330", date: today, transporteur: "Gaec du Verger", client: "Sofrimaix Pleug CG", statut: "Départ", heure_arrivee: makeTime(7, 0), heure_depart: makeTime(18, 53) },
    { id: "2026_0000331", date: today, transporteur: "Seafrigo", client: "Jademo",quai: "8" ,heure_arrivee: makeTime(14, 4) },
    { id: "2026_0000332", date: today, transporteur: "DFDS", client: "SMV Distribution", heure_arrivee: makeTime(11, 3) },
    { id: "2026_0000337", date: today, transporteur: "Avelita", client: "Cossard", immatriculation: "ve", heure_arrivee: makeTime(8, 24), heure_pret_ch: makeTime(14, 24) },
    { id: "2026_0000339", date: new Date("2026-09-22"), transporteur: "Grand Saloir", client: "Ferme De La Lande",quai: "6", heure_arrivee: makeTime(11, 54), heure_pret_ch: makeTime(13, 37), heure_depart: makeTime(14, 53) },
    { id: "2026_0000004", date: today, transporteur: "Gelatines Weishardt", immatriculation: "14-48-vs84", client: "Rennes CG", statut: "En parking", heure_arrivee: makeTime(18, 24) },
    { id: "2026_0000002", date: today, transporteur: "test 3", client: "client 1", heure_arrivee: makeTime(12, 3),statut: "En Chargement",quai: "1" },
    { id: "2026_0000005", date: today, transporteur: "test 2", client: "client 2", heure_arrivee: makeTime(18, 23) },
    { id: "2026_0000006", date: today, transporteur: "test 4", client: "client 4", heure_arrivee: makeTime(18, 23) },
    { id: "2026_0000007", date: today, transporteur: "test 5", client: "client 5", heure_arrivee: makeTime(18, 23) , statut: "Attente administrative",quai: "2" },
    { id: "2026_0000008", date: today, transporteur: "test 6", client: "client 6", heure_arrivee: makeTime(18, 23), statut: "Anomalie",quai: "9" },
    { id: "2026_0000009", date: today, transporteur: "test 7", client: "client 7", heure_arrivee: makeTime(18, 23) , statut: "Prêt",quai: "6" },
    { id: "2026_0000010", date: today, transporteur: "test 8", client: "client 8", heure_arrivee: makeTime(18, 23) },
    { id: "2026_0000011", date: today, transporteur: "test 9", client: "client 9", heure_arrivee: makeTime(18, 23) },
    { id: "2026_0000012", date: today, transporteur: "test 10", client: "client 10", heure_arrivee: makeTime(18, 23) },
  ];

    const objetsAnomalies = [
      {id: "2026_0000002" , horodatage_debut : new Date() , transporteur: "Seafrigo", immatriculation: "ok",
      client : "Andriopouloi" , type_anomalie : "Attente de Lamballe", idEnregistrement : "2026_0000324"},
      {id: "2026_0000001" , horodatage_debut : new Date(2026, 8, 22, 9, 30) , horodatage_fin : new Date(2026, 8, 22, 10, 0) , transporteur: "Grand Saloir",client : "Ferme De La Lande" , type_anomalie : "Attente de Lamballe", idEnregistrement : "2026_0000339"},
      {id: "2026_0000003" , horodatage_debut : new Date(2026, 8, 22, 10, 30) , horodatage_fin : new Date(2026, 8, 22, 12, 0) , transporteur: "Grand Saloir",client : "Ferme De La Lande" , type_anomalie : "Frigo en panne", idEnregistrement : "2026_0000339"},
    ];

  // 3. Instanciation des objets et création via le Repository
  objetsBase.forEach(donnees => {
    const enregistrement = new Enregistrement(donnees);
    EnregistrementRepository.creerEnregistrement(enregistrement);
  });

  objetsAnomalies.forEach(donnees => {
  const anomalie = new Anomalie(donnees);
  AnomalieRepository.creerAnomalie(anomalie);
});

  Logger.log(`${objetsBase.length} enregistrements insérés avec succès via EnregistrementRepository !`);
  Logger.log(`${objetsAnomalies.length} anomalies insérés avec succès via AnomalieRepository !`);
}



function testGetAll_() {
  reinitialiserCompteurTableau("Enregistrements");
  const resultats = EnregistrementRepository.getAll();
  
  console.log("Nombre d'enregistrements :", resultats.length);
  
  if (resultats.length > 0) {
    // 1. Affiche l'instance brute de la 1ère ligne
    console.log("Premier enregistrement (Objet JS) :", resultats[0]);
    
    // 2. Affiche la version sérialisée via toJSON() pour le front-end
    console.log("Premier enregistrement (toJSON) :", resultats[0].toJSON());
  }
}


function test2_ (){

  TemperatureRepository.getDossierDuDocument();

}


function testerGenererDocument_() {
  // 1. ID d'un gabarit Google Doc de test
  const idGabaritTest = "1OPg3AVpd9iVgw1qYzeUwY54N3y1YJ12zyddINzIoO5w"; 

  // 2. Jeu de données fictif (Simule la donnée renvoyée par le Service)
  const donneesTest = {
    date: new Date(),
    transporteur: "Stef & Transports",
    client: "Jademo S.A.",
    immatriculation: "AA-123-BB",
    quai: "Quai 04"
  };

  try {
    Logger.log("⏳ Début de la génération du document...");
    
    // 3. Appel de la méthode statique
    const resultat = TemperatureRepository.genererDocument(idGabaritTest, donneesTest , "Carcasse jour");

    // 4. Vérification des résultats dans la console
    Logger.log("✅ Document généré avec succès !");
    Logger.log("🆔 ID du fichier : " + resultat.id);
    Logger.log("🔗 URL du fichier : " + resultat.url);

  } catch (erreur) {
    Logger.log("❌ Erreur lors du test : " + erreur.message);
  }
}