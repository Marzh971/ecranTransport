/**
 * Génère un ID unique incrémenté pour un tableau spécifique.
 * @param {string} nomTableau - Le nom du tableau (ex: "Clients", "Factures")
 * @return {string} L'ID généré au format ANNEE_0000001
 */
function genererId_(nomTableau) {
  if (!nomTableau) throw new Error("Le nom du tableau est obligatoire.");

  const props = PropertiesService.getScriptProperties();

  // Crée une clé unique par tableau (ex: "compteur_Clients")
  const cleCompteur = `compteur_${nomTableau.replace(/\s+/g, '_')}`;
  let idUnique = "";

  // Sécurité pour les accès simultanés
  const verrou = LockService.getScriptLock();
  try {
    verrou.waitLock(30000); // Attend jusqu'à 30 secondes si occupé

    // 1. Récupérer le numéro propre à CE tableau
    let compteurActuel = parseInt(props.getProperty(cleCompteur)) || 0;
    compteurActuel++;

    // 2. Construire l'ID
    const annee = new Date().getFullYear();
    const sequenceFormatee = String(compteurActuel).padStart(7, '0');
    idUnique = `${annee}_${sequenceFormatee}`;

    // 3. Sauvegarder de manière permanente le nouveau numéro
    props.setProperty(cleCompteur, compteurActuel.toString());

  } catch (erreur) {
    throw new Error(`Erreur lors de la génération de l'ID pour ${nomTableau} : ${erreur.message}`);
  } finally {
    verrou.releaseLock(); // Libère le verrou
  }
  return idUnique;
}

/**
 * Réinitialise le compteur d'un tableau spécifique à 0.
 * @param {string} nomTableau - Le nom du tableau à réinitialiser (ex: "Clients", "Factures")
 */
function reinitialiserCompteurTableau_(nomTableau) {
  if (!nomTableau) throw new Error("Le nom du tableau est obligatoire.");

  const props = PropertiesService.getScriptProperties();

  // Recrée exactement la même clé que la fonction de génération
  const cleCompteur = `compteur_${nomTableau.replace(/\s+/g, '_')}`;

  // Supprime la propriété de façon permanente
  props.deleteProperty(cleCompteur);

  Logger.log(`Le compteur pour le tableau "${nomTableau}" a été réinitialisé à 0.`);
}

// méthode pour récupéré dernière ligne sans id d'un onglet
function trouver_derniere_ligne_(nom_onglet) {
  let tab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom_onglet).getRange("A:A").getValues();
  for (let i = tab.length - 1; i >= 0; i--) {
    const valeur = tab[i][0];
    if (valeur !== "" && valeur !== null && valeur !== undefined) {
      return i + 1; // +1 pour convertir l'index 0 en numéro de ligne Sheets
    }
  }
  return 1;
}

// méthode pour récupéré dernière ligne d'une colonne
function trouver_derniere_ligne_colonne_(nom_onglet, nom_colonne) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom_onglet);

  // Récupération de la première ligne (entêtes)
  const entetes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const indexColonne = entetes.indexOf(nom_colonne);

  if (indexColonne === -1) {
    console.log(`La colonne "${nom_colonne}" n'a pas été trouvée dans l'onglet "${nom_onglet}".`);
    return 1;
  }

  let tab = sheet.getRange(1, indexColonne + 1, sheet.getLastRow(), 1).getValues();

  for (let i = tab.length - 1; i >= 0; i--) {
    const valeur = tab[i][0];
    if (valeur !== "" && valeur !== null && valeur !== undefined) {
      return i + 1; // +1 pour convertir l'index 0 en numéro de ligne Sheets
    }
  }
  return 1;
}


function assainirNom_(chaine) {
  return chaine
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime les accents (é -> e)
    .replace(/[^a-zA-Z0-9_-]/g, "_")                 // Remplace espaces et caractères spéciaux par "_"
    .toUpperCase();
}

/**
 * Cherche un dossier par son nom dans un dossier parent.
 * S'il n'existe pas, il le crée.
 * 
 * @param {string} nomDossier - Le nom du dossier (ex: "2026-10")
 * @param {Folder} dossierParent - L'objet DriveApp.Folder parent (optionnel, racine par défaut)
 * @returns {Folder} L'objet DriveApp.Folder correspondant
 */
function obtenirOuCreerDossier_(nomDossier, dossierParent = null) {
  const parent = dossierParent || DriveApp.getRootFolder();

  // Chercher si le dossier existe déjà
  const dossiers = parent.getFoldersByName(nomDossier);

  // Si un dossier correspond, on le renvoie
  if (dossiers.hasNext()) {
    return dossiers.next();
  }

  // Sinon, on le crée
  return parent.createFolder(nomDossier);
}


