function doGet(e) {
  // Sécurité : si 'e' ou 'e.parameter' est absent (ex: test manuel dans l'éditeur), on évite le crash
  const params = (e && e.parameter) ? e.parameter : {};
  let page = params.page || "5_Pages/pageUtilisateur";
  
  LogService.logConnexion(page);

  const pagePossible = ["5_Pages/pageUtilisateur", "5_Pages/pageFids", "5_Pages/pageErreur403"];

  if (!SecurityService.verifUtilisateur()) {
    page = "5_Pages/pageErreur403";
  }

  if (!pagePossible.includes(page)) {
    page = "5_Pages/pageUtilisateur";
  }

  let template = HtmlService.createTemplateFromFile(page);
  let htmlOutput = template.evaluate();
  return htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Fonction permettant d'avoir des pages CSS et JavaScript séparées du code HTML
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function changerVueFids(type_affichage, donnees = null) {
  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }

  const payload = {
    type: type_affichage,
    donnees: donnees
  };

  const cache = CacheService.getScriptCache();
  cache.put("type_affichage", JSON.stringify(payload), 10000);
}



function recevoirCacheFids() {
  if (!SecurityService.verifUtilisateur()) return "AUCUN";

  let ordre = CacheService.getScriptCache().get("type_affichage");
  if (!ordre) return "AUCUN";

  let payload = JSON.parse(ordre);
  let temps = getTempsConfiguration();

  // On s'assure que "donnees" est bien un objet
  if (!payload.donnees || typeof payload.donnees !== 'object') {
    payload.donnees = {};
  }

  // Assignation directe des valeurs
  payload.donnees.tempsQuai = temps.tempsQuai;
  payload.donnees.tempsAttente = temps.tempsAttente;

  return payload;
}


function modifierTempsAffichage(tempsQuai, tempsAttente) {
  if (!SecurityService.estPasLecteur()) {
    throw new Error("Accès refusé : Action non autorisée.");
  }
  const proprietes = PropertiesService.getScriptProperties();
  proprietes.setProperty('TEMPS_QUAI', tempsQuai.toString());
  proprietes.setProperty('TEMPS_ATTENTE', tempsAttente.toString());
}

function apiGetContenuSvgPlan() {
  if (!SecurityService.verifUtilisateur()) {
    throw new Error("Accès refusé");
  }
  const imageId = "1Hl6iNICUrq-zlyZQv4CquMe85AWFrLii";
  return DriveApp.getFileById(imageId).getBlob().getDataAsString();
}

function getTempsConfiguration() {
  const proprietes = PropertiesService.getScriptProperties();
  return {
    tempsQuai: parseInt(proprietes.getProperty('TEMPS_QUAI') || "10", 10),
    tempsAttente: parseInt(proprietes.getProperty('TEMPS_ATTENTE') || "5", 10)
  };
  
}


/**
 * Fonction appelée par le déclencheur temporel
 */
function declencheurArchivageAutomatique() {
  ArchivageService.executerArchivageAuto();
}
